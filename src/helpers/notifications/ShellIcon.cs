using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Storage.Streams;

// Başlat menüsündeki (shell:AppsFolder) uygulamanın ikonunu PNG data URL olarak okur.
// Klasik Win32 uygulamaları (ör. NVIDIA App, PowerToys) paket logosu sunmadığı için gereklidir.
internal static class ShellIcon
{
    private const int SIIGBF_BIGGERSIZEOK = 0x1;
    private const int SIIGBF_ICONONLY = 0x4;
    private const uint DIB_RGB_COLORS = 0;

    [StructLayout(LayoutKind.Sequential)]
    private struct NativeSize
    {
        public int Width;
        public int Height;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct BitmapInfo
    {
        public int Type;
        public int Width;
        public int Height;
        public int WidthBytes;
        public ushort Planes;
        public ushort BitsPixel;
        public IntPtr Bits;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct BitmapInfoHeader
    {
        public uint Size;
        public int Width;
        public int Height;
        public ushort Planes;
        public ushort BitCount;
        public uint Compression;
        public uint SizeImage;
        public int XPelsPerMeter;
        public int YPelsPerMeter;
        public uint ClrUsed;
        public uint ClrImportant;
    }

    [ComImport]
    [Guid("bcc18b79-ba16-442f-80c4-8a59c30c463b")]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IShellItemImageFactory
    {
        [PreserveSig]
        int GetImage(NativeSize size, int flags, out IntPtr bitmap);
    }

    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    private static extern int SHCreateItemFromParsingName(
        string path,
        IntPtr bindContext,
        [In] ref Guid riid,
        [MarshalAs(UnmanagedType.Interface)] out IShellItemImageFactory item);

    [DllImport("gdi32.dll")]
    private static extern int GetObject(IntPtr handle, int size, ref BitmapInfo bitmap);

    [DllImport("gdi32.dll")]
    private static extern int GetDIBits(IntPtr dc, IntPtr bitmap, uint start, uint lines, [Out] byte[] bits, ref BitmapInfoHeader info, uint usage);

    [DllImport("gdi32.dll")]
    private static extern bool DeleteObject(IntPtr handle);

    [DllImport("user32.dll")]
    private static extern IntPtr GetDC(IntPtr window);

    [DllImport("user32.dll")]
    private static extern int ReleaseDC(IntPtr window, IntPtr dc);

    public static async Task<string?> ReadAppsFolderIcon(string appId, int size)
    {
        if (string.IsNullOrWhiteSpace(appId))
        {
            return null;
        }

        try
        {
            var pixels = ReadPixels($"shell:AppsFolder\\{appId}", size, out var width, out var height);
            if (pixels is null)
            {
                return null;
            }

            using var stream = new InMemoryRandomAccessStream();
            var encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.PngEncoderId, stream);
            encoder.SetPixelData(BitmapPixelFormat.Bgra8, BitmapAlphaMode.Premultiplied, (uint)width, (uint)height, 96, 96, pixels);
            await encoder.FlushAsync();

            stream.Seek(0);
            using var reader = new DataReader(stream);
            await reader.LoadAsync((uint)stream.Size);
            var bytes = new byte[stream.Size];
            reader.ReadBytes(bytes);
            return $"data:image/png;base64,{Convert.ToBase64String(bytes)}";
        }
        catch
        {
            return null;
        }
    }

    private static byte[]? ReadPixels(string parsingName, int size, out int width, out int height)
    {
        width = 0;
        height = 0;
        var iid = typeof(IShellItemImageFactory).GUID;
        if (SHCreateItemFromParsingName(parsingName, IntPtr.Zero, ref iid, out var factory) != 0 || factory is null)
        {
            return null;
        }

        var bitmap = IntPtr.Zero;
        try
        {
            if (factory.GetImage(new NativeSize { Width = size, Height = size }, SIIGBF_ICONONLY | SIIGBF_BIGGERSIZEOK, out bitmap) != 0 || bitmap == IntPtr.Zero)
            {
                return null;
            }

            var info = new BitmapInfo();
            if (GetObject(bitmap, Marshal.SizeOf<BitmapInfo>(), ref info) == 0 || info.Width <= 0 || info.Height <= 0 || info.Width > 512 || info.Height > 512)
            {
                return null;
            }

            width = info.Width;
            height = info.Height;
            var header = new BitmapInfoHeader
            {
                Size = (uint)Marshal.SizeOf<BitmapInfoHeader>(),
                Width = width,
                Height = -height,
                Planes = 1,
                BitCount = 32,
                Compression = 0
            };
            var pixels = new byte[width * height * 4];
            var dc = GetDC(IntPtr.Zero);
            try
            {
                if (GetDIBits(dc, bitmap, 0, (uint)height, pixels, ref header, DIB_RGB_COLORS) == 0)
                {
                    return null;
                }
            }
            finally
            {
                ReleaseDC(IntPtr.Zero, dc);
            }

            return pixels;
        }
        finally
        {
            if (bitmap != IntPtr.Zero)
            {
                DeleteObject(bitmap);
            }
            Marshal.ReleaseComObject(factory);
        }
    }
}
