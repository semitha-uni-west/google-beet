import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Beet - Video Meetings",
  description: "Premium video meetings. Now free for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
