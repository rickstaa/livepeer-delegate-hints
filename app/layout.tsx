/**
 * @file Contains main app layout.
 */
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GithubCorner } from "./components/GithubCorner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Delegate Hints",
  description:
    "Small app to retrieve delegator hints for orchestrators, helping reduce gas fees when interacting with Livepeer BondingManager contract.",
};

/**
 * Root layout component for the application.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GithubCorner href="https://github.com/rickstaa/livepeer-delegate-hints" />
        {children}
      </body>
    </html>
  );
}
