import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropertyManager | Real Estate Management System",
  description: "Modern real estate property management system designed for ease and efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${playfair.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <NextTopLoader
          color="#10b981"
          initialPosition={0.08}
          crawlSpeed={200}
          height={5}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #10b981,0 0 5px #10b981"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
