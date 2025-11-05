'use client'
import React, { useMemo, useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useAppSelector } from '@/store/hooks'

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const themeMode = useAppSelector((s) => s.ui.themeMode) || (prefersDark ? 'dark' : 'light')
  const theme = useMemo(() => createTheme({ palette: { mode: themeMode } }), [themeMode])
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeBridge>{children}</ThemeBridge>
      </PersistGate>
    </Provider>
  )
}
