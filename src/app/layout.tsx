import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import RightSidebar from "@/components/layout/RightSidebar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Gathered — Your Christian Community, Close to Home",
  description:
    "Gathered is the Christian community platform for the Minneapolis/Twin Cities Metro. Connect with neighbors, share prayer requests, find local churches, and serve your community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-[#262626] min-h-screen transition-colors duration-200">
        <Providers>
          <Navbar />
          {/* Offset content by sidebar width on desktop */}
          <div className="md:ml-64">
            <div className="max-w-5xl mx-auto px-4 py-6">
              <div className="flex gap-6 items-start">
                <main className="flex-1 min-w-0 pb-24 md:pb-6">{children}</main>
                <RightSidebar />
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
