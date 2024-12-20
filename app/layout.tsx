import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import StoreProvider from "./StoreProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collabor8 - Professional Networking & Project Collaboration Platform",
  description: "Collabor8 is a cutting-edge professional networking platform that connects students, entrepreneurs, and professionals worldwide. Discover project opportunities, share expertise, build meaningful connections, and advance your career through collaborative innovation. Join our community to access mentorship, showcase your portfolio, and engage in knowledge sharing that drives professional growth.",
  keywords: [
    "professional networking",
    "project collaboration",
    "career development",
    "student networking",
    "professional portfolio",
    "mentorship platform",
    "knowledge sharing",
    "professional community",
    "skill development",
    "career advancement",
    "networking platform",
    "collaborative projects",
  ],
  authors: [{ name: "Collabor8 Team" }],
  creator: "Collabor8",
  publisher: "Collabor8",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://thecollabor8.com'),
  openGraph: {
    title: "Collabor8 - Connect, Collaborate, and Grow Professionally",
    description: "Join Collabor8 to connect with professionals, collaborate on innovative projects, and accelerate your career growth through meaningful networking and knowledge sharing.",
    url: 'https://thecollabor8.com',
    siteName: 'Collabor8',
    locale: 'en_IN',
    type: 'website',
  },
  category: 'Professional Networking',
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <Analytics />
      <body className={`${inter.className} bg-dark-900 max-h-screen overflow-hidden text-white-500`}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
};

export default RootLayout;