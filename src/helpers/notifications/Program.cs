using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using Windows.UI.Notifications;
using Windows.UI.Notifications.Management;

internal sealed record NotificationPayload(
    bool Available,
    string Status,
    IReadOnlyList<NotificationItem> Notifications
);

internal sealed record NotificationItem(
    string Id,
    string App,
    string Title,
    string Message,
    long CreatedAt
);

internal static class Program
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
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
            var items = notifications
                .Select(ToItem)
                .Where(item => !string.IsNullOrWhiteSpace(item.Title) || !string.IsNullOrWhiteSpace(item.Message))
                .OrderByDescending(item => item.CreatedAt)
                .Take(12)
                .ToArray();

            Write(new NotificationPayload(true, "allowed", items));
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
            createdAt
        );
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
