using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class LogoProcessor
{
    public static void CropLogos(string sourcePath, string outDarkPath, string outLightPath)
    {
        using (Bitmap src = new Bitmap(sourcePath))
        {
            // 1. Dark logo: center ~ (265, 248), size ~ 416x402
            // Crop 416x416 centered around the card: Top-left = (57, 40)
            int darkX = 57, darkY = 40, darkW = 416, darkH = 416;
            using (Bitmap darkBmp = new Bitmap(darkW, darkH, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(darkBmp))
                {
                    g.DrawImage(src, new Rectangle(0, 0, darkW, darkH), new Rectangle(darkX, darkY, darkW, darkH), GraphicsUnit.Pixel);
                }

                // Mask corners to transparent using exact squircle rounded rectangle path with antialiasing
                using (GraphicsPath path = GetRoundedRectPath(new Rectangle(2, 6, darkW - 4, 404), 84))
                {
                    using (Bitmap maskedDark = new Bitmap(darkW, darkH, PixelFormat.Format32bppArgb))
                    {
                        using (Graphics gMask = Graphics.FromImage(maskedDark))
                        {
                            gMask.SmoothingMode = SmoothingMode.AntiAlias;
                            gMask.InterpolationMode = InterpolationMode.HighQualityBicubic;
                            gMask.PixelOffsetMode = PixelOffsetMode.HighQuality;
                            gMask.SetClip(path);
                            gMask.DrawImage(darkBmp, 0, 0);
                        }
                        maskedDark.Save(outDarkPath, ImageFormat.Png);
                    }
                }
            }

            // 2. Light logo: center ~ (757, 248), size ~ 416x402
            // Top-left = (757 - 208, 248 - 208) = (549, 40)
            int lightX = 549, lightY = 40, lightW = 416, lightH = 416;
            using (Bitmap lightBmp = new Bitmap(lightW, lightH, PixelFormat.Format32bppArgb))
            {
                using (Graphics g = Graphics.FromImage(lightBmp))
                {
                    g.DrawImage(src, new Rectangle(0, 0, lightW, lightH), new Rectangle(lightX, lightY, lightW, lightH), GraphicsUnit.Pixel);
                }

                // Mask corners to transparent using exact squircle rounded rectangle path with antialiasing
                using (GraphicsPath path = GetRoundedRectPath(new Rectangle(2, 6, lightW - 4, 404), 84))
                {
                    using (Bitmap maskedLight = new Bitmap(lightW, lightH, PixelFormat.Format32bppArgb))
                    {
                        using (Graphics gMask = Graphics.FromImage(maskedLight))
                        {
                            gMask.SmoothingMode = SmoothingMode.AntiAlias;
                            gMask.InterpolationMode = InterpolationMode.HighQualityBicubic;
                            gMask.PixelOffsetMode = PixelOffsetMode.HighQuality;
                            gMask.SetClip(path);
                            gMask.DrawImage(lightBmp, 0, 0);
                        }
                        maskedLight.Save(outLightPath, ImageFormat.Png);
                    }
                }
            }
        }
    }

    private static GraphicsPath GetRoundedRectPath(Rectangle rect, int radius)
    {
        GraphicsPath path = new GraphicsPath();
        int d = radius * 2;
        path.AddArc(rect.X, rect.Y, d, d, 180, 90);
        path.AddArc(rect.Right - d, rect.Y, d, d, 270, 90);
        path.AddArc(rect.Right - d, rect.Bottom - d, d, d, 0, 90);
        path.AddArc(rect.X, rect.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }
}
