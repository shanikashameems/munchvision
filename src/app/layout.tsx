import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MunchVision — Chill Food Analytics",
  description: "Decode your plate instantly using Gemini Vision AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-neutral-200 dark:selection:bg-neutral-800">
        {children}
      </body>
    </html>
  );
}