import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pipeline de Lançamento de Produtos",
  description: "Stage-gate de lançamento de produtos allu",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
