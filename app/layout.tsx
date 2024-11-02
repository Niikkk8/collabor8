import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import StoreProvider from "./StoreProvider";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collabor8",
  description: "Collabor8 is a professional networking platform.  that combines the elements of professional networking, project collaboration, and knowledge sharing, catering to both students and working professionals. This platform will enable users to connect, collaborate on projects, share insights, and grow their professional network.",
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <Analytics />
      <body className={`${inter.className} bg-dark-900 max-h-screen overflow-scroll text-white-500`}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
};

export default RootLayout;