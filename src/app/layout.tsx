import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Casa",
  description: "Gestão pessoal de despensa e cozinha",
  appleWebApp: {
    title: "Casa",
    capable: true,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2e4a38",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg text-ink">
        <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-bg">
          {children}
        </div>
      </body>
    </html>
  );
}
