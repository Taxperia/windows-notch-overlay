using System;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
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
    string? ThumbnailDataUrl
);

internal static class Program
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    private static async Task<int> Main()
    {
        try
        {
            var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
            var sessions = manager.GetSessions();
            var session = sessions.FirstOrDefault(IsSpotify)
                ?? manager.GetCurrentSession()
                ?? sessions.FirstOrDefault();

            if (session is null)
            {
                Write(new MediaPayload(false, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, "not-running", 0, 0, null));
                return 0;
            }

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
                thumbnailDataUrl
            ));
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            Write(new MediaPayload(false, string.Empty, string.Empty, string.Empty, string.Empty, string.Empty, "unavailable", 0, 0, null));
            return 0;
        }
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
