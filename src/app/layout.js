import { Inter } from "next/font/google";
import "./globals.css";
import CommonLayout from "@/components/CommonLayout";
import { QueryProvider } from "@/providers/queryProviders";

import SmoothScrolling from "@/components/SmoothScrolling";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gurusharan Portfolio App",
  description: "I am Gurusharan Singh Full Stack Developer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SmoothScrolling>
          <CommonLayout><QueryProvider>{children}</QueryProvider></CommonLayout>
        </SmoothScrolling>
      </body>
    </html>
  );
}
