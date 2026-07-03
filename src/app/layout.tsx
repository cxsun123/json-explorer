import type { Metadata } from "next";
import "./globals.css";
import { LocaleProvider } from "@/lib/locales/LocaleContext";

export const metadata: Metadata = {
  title: "JSON Viewer",
  description: "Online JSON file parser and viewer with Text, Tree, and Table views",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col font-sans antialiased" suppressHydrationWarning>
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
