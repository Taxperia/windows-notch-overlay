using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.Media;
using Windows.Media.Control;
using Windows.Storage.Streams;

internal sealed record MediaPayload(
    bool Available,
    string App,
    string Source,
    string Title,
    string Artist,
    string Album,
    string Status,
    double DurationMs,
    double PositionMs,
    string? ThumbnailDataUrl,
    bool? Shuffle = null,
    string? Repeat = null,
    bool CanShuffle = false,
    bool CanRepeat = false,
    bool CanSeek = false,
    bool CanPrevious = true,
    bool CanNext = true
);

internal static class Program
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private static async Task<int> Main(string[] args)
    {
        try
        {
            var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
            var sessions = manager.GetSessions();
            var source = SourcePreference(args);
            var command = CommandArg(args);
            var positionMs = PositionArg(args);
            var session = SelectSession(manager, sessions, source);

            if (session is null)
            {
                Write(new MediaPayload(false, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, "not-running", 0, 0, null));
                return 0;
            }

            if (!string.IsNullOrWhiteSpace(command))
            {
                await ExecuteCommand(session, command, positionMs);
                await Task.Delay(160);
            }

            await WriteSession(session);
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            Write(new MediaPayload(false, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, "unavailable", 0, 0, null));
            return 0;
        }
    }

    private static string SourcePreference(string[] args)
    {
        var sourceArg = args.FirstOrDefault(arg => arg.StartsWith("--source=", StringComparison.OrdinalIgnoreCase));
        return sourceArg?.Split('=', 2).LastOrDefault()?.ToLowerInvariant() ?? "spotify";
    }

    private static string? CommandArg(string[] args)
    {
        var commandArg = args.FirstOrDefault(arg => arg.StartsWith("--command=", StringComparison.OrdinalIgnoreCase));
        return commandArg?.Split('=', 2).LastOrDefault();
    }

    private static double? PositionArg(string[] args)
    {
        var positionArg = args.FirstOrDefault(arg => arg.StartsWith("--position=", StringComparison.OrdinalIgnoreCase));
        var raw = positionArg?.Split('=', 2).LastOrDefault();
        return double.TryParse(raw, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var value) && value >= 0
            ? value
            : null;
    }

    private static GlobalSystemMediaTransportControlsSession? SelectSession(
        GlobalSystemMediaTransportControlsSessionManager manager,
        IReadOnlyList<GlobalSystemMediaTransportControlsSession> sessions,
        string source
    )
    {
        return source switch
        {
            "active" => manager.GetCurrentSession() ?? sessions.FirstOrDefault(IsSpotify) ?? sessions.FirstOrDefault(),
            "any" => manager.GetCurrentSession() ?? sessions.FirstOrDefault(),
            _ => sessions.FirstOrDefault(IsSpotify) ?? manager.GetCurrentSession() ?? sessions.FirstOrDefault()
        };
    }

    private static async Task ExecuteCommand(GlobalSystemMediaTransportControlsSession session, string command, double? positionMs)
    {
        var normalized = command.Trim().ToLowerInvariant();
        switch (normalized)
        {
            case "shuffle":
                await session.TryChangeShuffleActiveAsync(!(session.GetPlaybackInfo().IsShuffleActive ?? false));
                return;
            case "repeat":
                await session.TryChangeAutoRepeatModeAsync(NextRepeatMode(session.GetPlaybackInfo().AutoRepeatMode));
                return;
            case "seek":
                {
                    if (positionMs is null)
                    {
                        throw new InvalidOperationException("Seek requires --position.");
                    }

                    var timeline = session.GetTimelineProperties();
                    var target = timeline.StartTime + TimeSpan.FromMilliseconds(positionMs.Value);
                    if (timeline.EndTime > timeline.StartTime && target > timeline.EndTime)
                    {
                        target = timeline.EndTime;
                    }

                    await session.TryChangePlaybackPositionAsync(target.Ticks);
                    return;
                }
            case "previous":
                await session.TrySkipPreviousAsync();
                return;
            case "next":
                await session.TrySkipNextAsync();
                return;
            case "play":
                await session.TryPlayAsync();
                return;
            case "pause":
                await session.TryPauseAsync();
                return;
            case "playpause":
            case "play-pause":
            case "toggle":
                if (session.GetPlaybackInfo().PlaybackStatus == GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing)
                {
                    await session.TryPauseAsync();
                    return;
                }

                await session.TryPlayAsync();
                return;
            default:
                throw new InvalidOperationException($"Unsupported media command: {command}");
        }
    }

    private static MediaPlaybackAutoRepeatMode NextRepeatMode(MediaPlaybackAutoRepeatMode? current)
    {
        return current switch
        {
            MediaPlaybackAutoRepeatMode.List => MediaPlaybackAutoRepeatMode.Track,
            MediaPlaybackAutoRepeatMode.Track => MediaPlaybackAutoRepeatMode.None,
            _ => MediaPlaybackAutoRepeatMode.List
        };
    }

    private static string? RepeatName(MediaPlaybackAutoRepeatMode? mode)
    {
        return mode switch
        {
            MediaPlaybackAutoRepeatMode.List => "list",
            MediaPlaybackAutoRepeatMode.Track => "track",
            MediaPlaybackAutoRepeatMode.None => "none",
            _ => null
        };
    }

    private static async Task WriteSession(GlobalSystemMediaTransportControlsSession session)
    {
        var properties = await session.TryGetMediaPropertiesAsync();
        var timeline = session.GetTimelineProperties();
        var playback = session.GetPlaybackInfo();
        var status = playback.PlaybackStatus.ToString().ToLowerInvariant();
        var durationMs = Math.Max(0, (timeline.EndTime - timeline.StartTime).TotalMilliseconds);
        var positionMs = Math.Max(0, timeline.Position.TotalMilliseconds);
        var thumbnailDataUrl = await ReadThumbnailDataUrl(properties.Thumbnail);

        Write(new MediaPayload(
            true,
            AppName(session.SourceAppUserModelId),
            session.SourceAppUserModelId,
            properties.Title ?? string.Empty,
            properties.Artist ?? string.Empty,
            properties.AlbumTitle ?? string.Empty,
            status,
            durationMs,
            positionMs,
            thumbnailDataUrl,
            playback.IsShuffleActive,
            RepeatName(playback.AutoRepeatMode),
            playback.Controls.IsShuffleEnabled,
            playback.Controls.IsRepeatEnabled,
            playback.Controls.IsPlaybackPositionEnabled,
            playback.Controls.IsPreviousEnabled,
            playback.Controls.IsNextEnabled
        ));
    }

    private static bool IsSpotify(GlobalSystemMediaTransportControlsSession session)
    {
        return session.SourceAppUserModelId.Contains("spotify", StringComparison.OrdinalIgnoreCase);
    }

    private static string AppName(string source)
    {
        if (source.Contains("spotify", StringComparison.OrdinalIgnoreCase))
        {
            return "Spotify";
        }

        var app = source.Split('!')[0].Split('.').LastOrDefault();
        return string.IsNullOrWhiteSpace(app) ? "Medya" : app;
    }

    private static async Task<string?> ReadThumbnailDataUrl(IRandomAccessStreamReference? thumbnail)
    {
        if (thumbnail is null)
        {
            return null;
        }

        using var stream = await thumbnail.OpenReadAsync();
        if (stream.Size == 0 || stream.Size > 5 * 1024 * 1024)
        {
            return null;
        }

        using var reader = new DataReader(stream);
        await reader.LoadAsync((uint)stream.Size);
        var bytes = new byte[stream.Size];
        reader.ReadBytes(bytes);
        return $"data:image/jpeg;base64,{Convert.ToBase64String(bytes)}";
    }

    private static void Write(MediaPayload payload)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.WriteLine(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
