'use client'
import React from 'react'
import { Providers } from '@/app/providers'
import CssBaseline from '@mui/material/CssBaseline'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
