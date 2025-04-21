import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CoinProvider } from '../context/coinContext'; 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vultra",
  description: `Vultra | Your Gateway to Profitable Trading Alerts, Expert Insights & Financial Mastery
Unlock real-time trading alerts, actionable market analysis, and expert-led financial education with Vultra. Whether you're a novice or seasoned trader, our platform empowers you to make confident decisions with proven strategies, risk management tools, and step-by-step guides. Stay ahead of market trends, grow your portfolio, and join a community dedicated to financial success. Transform your trading journey—start with Vultra today!`
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CoinProvider>{children}</CoinProvider>
      </body>
    </html>
  );
}
