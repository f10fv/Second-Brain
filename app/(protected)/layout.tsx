import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Sidebar } from "./_components/sidebar";
import { Header } from "./_components/navbar";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Your personal knowledge management system",
}

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden md:ml-64">
        <Header />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
