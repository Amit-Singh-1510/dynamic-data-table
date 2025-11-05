'use client'
import React from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleThemeMode } from '@/store/uiSlice'

export function ThemeToggle() {
  const mode = useAppSelector((s) => s.ui.themeMode)
  const dispatch = useAppDispatch()

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton onClick={() => dispatch(toggleThemeMode())} size="small">
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  )
}
