'use client'
import React, { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Checkbox, FormControlLabel, TextField,
  MenuItem, IconButton, Stack, Tooltip
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useAppDispatch, useAppSelector } from '@/store'
import { addColumn, toggleColumnVisibility } from '@/store/tableSlice'

export function ManageColumnsModal() {
  const [open, setOpen] = useState(false)
  const [newColName, setNewColName] = useState('')
  const [newColType, setNewColType] = useState<'string' | 'number' | 'email'>('string')
  const dispatch = useAppDispatch()
  const { columns } = useAppSelector((s) => s.table)

  const handleToggle = (field: string, visible: boolean) => {
    dispatch(toggleColumnVisibility({ field, visible }))
  }

  const handleAddColumn = () => {
    const trimmed = newColName.trim()
    if (!trimmed) {
      alert('Please enter a valid column name')
      return
    }

    const field = trimmed.toLowerCase().replace(/\s+/g, '_')
    const headerName = trimmed.replace(/\b\w/g, (s) => s.toUpperCase())

    if (columns.some((c) => c.field === field)) {
      alert('Column already exists!')
      return
    }

    dispatch(addColumn({ headerName, field, type: newColType }))
    setNewColName('')
    setNewColType('string')
  }

  return (
    <>
      <Tooltip title="Manage Columns">
        <IconButton onClick={() => setOpen(true)} color="primary">
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Manage Columns</DialogTitle>
        <DialogContent dividers>
          {/* Existing columns list */}
          <Stack spacing={1}>
            {columns.map((col) => (
              <FormControlLabel
                key={col.field}
                control={
                  <Checkbox
                    checked={col.visible}
                    onChange={(e) => handleToggle(col.field, e.target.checked)}
                  />
                }
                label={col.headerName}
              />
            ))}
          </Stack>

          <hr style={{ margin: '16px 0' }} />

          {/* Add new column section */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              label="New Column"
              size="small"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Type"
              select
              size="small"
              value={newColType}
              onChange={(e) => setNewColType(e.target.value as any)}
              sx={{ width: 120 }}
            >
              <MenuItem value="string">String</MenuItem>
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="email">Email</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleAddColumn} variant="contained">
            Add
          </Button>
          <Button onClick={() => setOpen(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
