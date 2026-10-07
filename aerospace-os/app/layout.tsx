import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Aerospace OS — Service Requests", description: "Aerospace Computers customer service request workflow" };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
