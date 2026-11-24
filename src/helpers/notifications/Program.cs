using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.ApplicationModel;
using Windows.Foundation;
using Windows.Storage.Streams;
using Windows.UI.Notifications;
using Windows.UI.Notifications.Management;

internal sealed record NotificationPayload(
    bool Available,
    string Status,
    IReadOnlyList<NotificationItem> Notifications,
    IReadOnlyDictionary<string, string>? Logos = null
);

internal sealed record NotificationItem(
    string Id,
    string App,
    string Title,
    string Message,
    long CreatedAt,
    string AppId = ""
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
            var listener = UserNotificationListener.Current;
            var access = listener.GetAccessStatus();
            if (access == UserNotificationListenerAccessStatus.Unspecified && args.Contains("--request"))
            {
                access = await listener.RequestAccessAsync();
            }

            if (access != UserNotificationListenerAccessStatus.Allowed)
            {
                Write(new NotificationPayload(false, access.ToString().ToLowerInvariant(), Array.Empty<NotificationItem>()));
                return 0;
            }

            var notifications = await listener.GetNotificationsAsync(NotificationKinds.Toast);
            var selected = notifications
                .Select(notification => (Source: notification, Item: ToItem(notification)))
                .Where(entry => !string.IsNullOrWhiteSpace(entry.Item.Title) || !string.IsNullOrWhiteSpace(entry.Item.Message))
                .OrderByDescending(entry => entry.Item.CreatedAt)
                .Take(12)
                .ToArray();
            var items = selected.Select(entry => entry.Item).ToArray();

            // Logolar yalnızca istendiğinde okunur; çağıran taraf uygulama başına önbelleğe alır.
            Dictionary<string, string>? logos = null;
            if (args.Contains("--with-logos"))
            {
                logos = new Dictionary<string, string>();
                foreach (var group in selected.Where(entry => !string.IsNullOrWhiteSpace(entry.Item.AppId)).GroupBy(entry => entry.Item.AppId))
                {
                    var logo = await ReadLogo(group.First().Source.AppInfo);
                    if (logo is not null)
                    {
                        logos[group.Key] = logo;
                    }
                }
            }

            Write(new NotificationPayload(true, "allowed", items, logos));
            return 0;
        }
        catch (Exception error)
        {
            Console.Error.WriteLine(error.Message);
            Write(new NotificationPayload(false, "unavailable", Array.Empty<NotificationItem>()));
            return 0;
        }
    }

    private static NotificationItem ToItem(UserNotification notification)
    {
        var app = notification.AppInfo?.DisplayInfo?.DisplayName;
        if (string.IsNullOrWhiteSpace(app))
        {
            app = notification.AppInfo?.AppUserModelId ?? "Bildirim";
        }

        var texts = TextParts(notification.Notification).ToArray();
        var title = texts.FirstOrDefault() ?? string.Empty;
        var message = texts.Length > 1
            ? string.Join(" - ", texts.Skip(1))
            : string.Empty;
        var createdAt = notification.CreationTime.ToUnixTimeMilliseconds();
        var id = $"{notification.AppInfo?.AppUserModelId ?? app}:{notification.Id}:{createdAt}";

        return new NotificationItem(
            id,
            app,
            title,
            message,
            createdAt,
            notification.AppInfo?.AppUserModelId ?? string.Empty
        );
    }

    // Sıra: paketli uygulama logosu → bildirim kaydındaki IconUri → Başlat menüsündeki uygulama ikonu.
    private static async Task<string?> ReadLogo(AppInfo? info)
    {
        var appId = info?.AppUserModelId ?? string.Empty;
        var logo = await ReadPackageLogo(info)
            ?? ReadRegisteredIcon(appId)
            ?? await ShellIcon.ReadAppsFolderIcon(appId, 64);
        return logo is null ? null : await LogoTrim.TrimDataUrl(logo);
    }

    private static string? ReadRegisteredIcon(string appId)
    {
        if (string.IsNullOrWhiteSpace(appId))
        {
            return null;
        }

        try
        {
            foreach (var root in new[] { Microsoft.Win32.Registry.CurrentUser, Microsoft.Win32.Registry.LocalMachine })
            {
                using var key = root.OpenSubKey($@"Software\Classes\AppUserModelId\{appId}");
                var iconPath = key?.GetValue("IconUri") as string;
                if (string.IsNullOrWhiteSpace(iconPath) || !System.IO.File.Exists(iconPath))
                {
                    continue;
                }

                var contentType = System.IO.Path.GetExtension(iconPath).ToLowerInvariant() switch
                {
                    ".png" => "image/png",
                    ".ico" => "image/x-icon",
                    ".jpg" or ".jpeg" => "image/jpeg",
                    _ => null
                };
                var info = new System.IO.FileInfo(iconPath);
                if (contentType is null || info.Length == 0 || info.Length > 160 * 1024)
                {
                    continue;
                }

                return $"data:{contentType};base64,{Convert.ToBase64String(System.IO.File.ReadAllBytes(iconPath))}";
            }
        }
        catch
        {
            // Fall through to the shell icon.
        }

        return null;
    }

    private static async Task<string?> ReadPackageLogo(AppInfo? info)
    {
        try
        {
            var reference = info?.DisplayInfo?.GetLogo(new Size(64, 64));
            if (reference is null)
            {
                return null;
            }

            using var stream = await reference.OpenReadAsync();
            if (stream.Size == 0 || stream.Size > 160 * 1024)
            {
                return null;
            }

            using var reader = new DataReader(stream);
            await reader.LoadAsync((uint)stream.Size);
            var bytes = new byte[stream.Size];
            reader.ReadBytes(bytes);
            var contentType = string.IsNullOrWhiteSpace(stream.ContentType) ? "image/png" : stream.ContentType.ToLowerInvariant();
            return $"data:{contentType};base64,{Convert.ToBase64String(bytes)}";
        }
        catch
        {
            return null;
        }
    }

    private static IEnumerable<string> TextParts(Notification notification)
    {
        var binding = notification.Visual.GetBinding(KnownNotificationBindings.ToastGeneric);
        if (binding is null)
        {
            yield break;
        }

        foreach (var text in binding.GetTextElements())
        {
            var value = text.Text?.Trim();
            if (!string.IsNullOrWhiteSpace(value))
            {
                yield return value;
            }
        }
    }

    private static void Write(NotificationPayload payload)
    {
        Console.OutputEncoding = System.Text.Encoding.UTF8;
        Console.WriteLine(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
