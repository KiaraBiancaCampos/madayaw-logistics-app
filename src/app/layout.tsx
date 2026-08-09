import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// Load the Google Font
const fontSerif = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Madayaw Gas Fleet Management",
  description: "Logistics Supervision System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font class to the body */}
      <body className={`${fontSerif.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}