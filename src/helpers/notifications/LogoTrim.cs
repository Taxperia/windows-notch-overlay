using System;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Storage.Streams;

// Paketli uygulama logoları genellikle geniş saydam kenar boşluğuyla gelir ve küçük görünür.
// Görünür piksellerin çevresi kare olarak kırpılır; zaten dolu logolara dokunulmaz.
internal static class LogoTrim
{
    private const byte AlphaThreshold = 16;
    private const double MarginRatio = 0.06;
    private const double AlreadyTightRatio = 0.86;

    public static async Task<string> TrimDataUrl(string dataUrl)
    {
        try
        {
            var comma = dataUrl.IndexOf(',');
            if (comma < 0 || !dataUrl.Substring(0, comma).EndsWith(";base64", StringComparison.OrdinalIgnoreCase))
            {
                return dataUrl;
            }

            var trimmed = await Trim(Convert.FromBase64String(dataUrl[(comma + 1)..]));
            return trimmed is null ? dataUrl : $"data:image/png;base64,{Convert.ToBase64String(trimmed)}";
        }
        catch
        {
            return dataUrl;
        }
    }

    private static async Task<byte[]?> Trim(byte[] bytes)
    {
        using var input = new InMemoryRandomAccessStream();
        using (var writer = new DataWriter(input))
        {
            writer.WriteBytes(bytes);
            await writer.StoreAsync();
            writer.DetachStream();
        }
        input.Seek(0);

        var decoder = await BitmapDecoder.CreateAsync(input);
        var width = (int)decoder.PixelWidth;
        var height = (int)decoder.PixelHeight;
        if (width <= 0 || height <= 0 || width > 1024 || height > 1024)
        {
            return null;
        }

        var data = await decoder.GetPixelDataAsync(
            BitmapPixelFormat.Bgra8,
            BitmapAlphaMode.Premultiplied,
            new BitmapTransform(),
            ExifOrientationMode.IgnoreExifOrientation,
            ColorManagementMode.DoNotColorManage);
        var pixels = data.DetachPixelData();

        int minX = width, minY = height, maxX = -1, maxY = -1;
        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
            {
                if (pixels[(y * width + x) * 4 + 3] <= AlphaThreshold)
                {
                    continue;
                }
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }

        if (maxX < 0)
        {
            return null;
        }

        var contentWidth = maxX - minX + 1;
        var contentHeight = maxY - minY + 1;
        var content = Math.Max(contentWidth, contentHeight);
        if (content >= Math.Max(width, height) * AlreadyTightRatio)
        {
            return null;
        }

        var margin = (int)Math.Round(content * MarginRatio);
        var side = content + margin * 2;
        var output = new byte[side * side * 4];
        var offsetX = (side - contentWidth) / 2;
        var offsetY = (side - contentHeight) / 2;
        for (var y = 0; y < contentHeight; y++)
        {
            System.Buffer.BlockCopy(pixels, ((minY + y) * width + minX) * 4, output, ((offsetY + y) * side + offsetX) * 4, contentWidth * 4);
        }

        using var result = new InMemoryRandomAccessStream();
        var encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.PngEncoderId, result);
        encoder.SetPixelData(BitmapPixelFormat.Bgra8, BitmapAlphaMode.Premultiplied, (uint)side, (uint)side, 96, 96, output);
        await encoder.FlushAsync();

        result.Seek(0);
        using var reader = new DataReader(result);
        await reader.LoadAsync((uint)result.Size);
        var encoded = new byte[result.Size];
        reader.ReadBytes(encoded);
        return encoded;
    }
}
