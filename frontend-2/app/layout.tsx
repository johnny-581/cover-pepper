import type { Metadata } from "next";
import { Merriweather, Noto_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cover Pepper",
  description: "An intelligent cover letter editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${merriweather.variable} ${notoSans.variable} antialiased`}
      >
        <Providers>
          {children}
          <div id="portal-root" />
        </Providers>
      </body>
    </html>
  );
}
