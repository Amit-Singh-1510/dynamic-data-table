'use client'
import React, { useMemo, useState } from 'react'
import {
  Paper, Stack, TextField, Button, IconButton, Table,
  TableBody, TableCell, TableContainer, TableHead, TablePagination,
  TableRow, TableSortLabel, Tooltip, Typography, Divider
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  setSearch, setSort, setPage, setPageSize,
  updateCell, deleteRow, addCustomRow
} from '@/store/tableSlice'
import { nanoid } from '@reduxjs/toolkit'

function validateValue(type: string, value: string) {
  if (type === 'number') return /^-?\d+(\.\d+)?$/.test(value)
  if (type === 'email') return /.+@.+\..+/.test(value)
  return true
}

export function DataTable() {
  const dispatch = useAppDispatch()
  const { columns, rows, search, sort, page, pageSize } = useAppSelector((s) => s.table)
  const visibleColumns = columns.filter((c) => c.visible)

  const [editingMap, setEditingMap] = useState<Record<string, Record<string, any>>>({})
  const [draftMap, setDraftMap] = useState<Record<string, Record<string, any>>>({})
  const [newRows, setNewRows] = useState<any[]>([])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? rows.filter((r) =>
          Object.keys(r).some((k) => k !== 'id' && String(r[k]).toLowerCase().includes(q))
        )
      : rows
    if (!sort) return base
    const { field, direction } = sort
    return [...base].sort((a, b) => compareAny(a[field], b[field], direction))
  }, [rows, search, sort])

  const combinedRows = [...newRows, ...filtered]
  const paged = useMemo(() => {
    const start = page * pageSize
    return combinedRows.slice(start, start + pageSize)
  }, [combinedRows, page, pageSize])

  const handleSort = (field: string) => {
    if (!sort || sort.field !== field) dispatch(setSort({ field, direction: 'asc' }))
    else if (sort.direction === 'asc') dispatch(setSort({ field, direction: 'desc' }))
    else dispatch(setSort(null))
  }

  const handleAddRow = () => {
    const newId = nanoid()
    const emptyRow: any = { id: newId }
    visibleColumns.forEach((c) => (emptyRow[c.field] = ''))
    setNewRows((prev) => [emptyRow, ...prev])

    setEditingMap((prev) => ({
      ...prev,
      [newId]: visibleColumns.reduce((acc, c) => ({ ...acc, [c.field]: true }), {}),
    }))
    setDraftMap((prev) => ({
      ...prev,
      [newId]: visibleColumns.reduce((acc, c) => ({ ...acc, [c.field]: '' }), {}),
    }))
  }

  const handleEditStart = (id: string, field: string, value: any) => {
    setEditingMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: true },
    }))
    setDraftMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: String(value) },
    }))
  }

  const handleDraftChange = (id: string, field: string, value: string) => {
    setDraftMap((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value },
    }))
  }

  const handleSaveAll = () => {
    let hasError = false

    Object.entries(draftMap).forEach(([rowId, fields]) => {
      Object.entries(fields).forEach(([field, value]) => {
        const col = columns.find((c) => c.field === field)
        if (col && !validateValue(col.type, value)) {
          alert(`Invalid value for "${col.headerName}". Please correct it before saving.`)
          hasError = true
        }
      })
    })
    if (hasError) return

    Object.entries(draftMap).forEach(([rowId, fields]) => {
      const isNewRow = newRows.some((r) => r.id === rowId)
      const mergedFields = { ...fields }

      if (isNewRow) {
        const newRow: any = { id: rowId }
        visibleColumns.forEach((col) => {
          const rawValue = mergedFields[col.field] ?? ''
          newRow[col.field] = castByType(columns, col.field, rawValue)
        })
        dispatch(addCustomRow(newRow))
      } else {
        Object.entries(mergedFields).forEach(([f, val]) => {
          dispatch(updateCell({ id: rowId, field: f, value: castByType(columns, f, val) }))
        })
      }
    })

    setNewRows([])
    setEditingMap({})
    setDraftMap({})
  }

  const handleCancelAll = () => {
    setNewRows([])
    setEditingMap({})
    setDraftMap({})
  }

  const isEditingSomething = Object.keys(editingMap).length > 0 || newRows.length > 0

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
        <TextField placeholder="Search all fields..." value={search} onChange={(e) => dispatch(setSearch(e.target.value))} fullWidth />
        <Stack direction="row" spacing={1}>
          {!isEditingSomething && (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddRow}>Add Row</Button>
          )}
          {isEditingSomething && (
            <>
              <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSaveAll}>Save All</Button>
              <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancelAll}>Cancel All</Button>
            </>
          )}
        </Stack>
      </Stack>

      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell key={col.field} sx={{ fontWeight: 600, minWidth: 120 }}>
                  <TableSortLabel active={!!sort && sort.field === col.field} direction={sort?.field === col.field ? sort.direction : 'asc'} onClick={() => handleSort(col.field)}>
                    {col.headerName}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((row) => (
              <TableRow key={row.id} hover>
                {visibleColumns.map((col) => {
                  const value = draftMap[row.id]?.[col.field] ?? row[col.field] ?? ''
                  const isEditing = editingMap[row.id]?.[col.field]
                  return (
                    <TableCell key={col.field} onDoubleClick={() => col.editable && handleEditStart(row.id, col.field, value)}>
                      {isEditing ? (
                        <TextField size="small" autoFocus placeholder={col.headerName} value={value} onChange={(e) => handleDraftChange(row.id, col.field, e.target.value)} />
                      ) : (
                        <Typography variant="body2" color={value ? 'text.primary' : 'text.disabled'}>
                          {String(value) || `Double click to add ${col.headerName}`}
                        </Typography>
                      )}
                    </TableCell>
                  )
                })}
                <TableCell align="right">
                  <Tooltip title="Delete row">
                    <IconButton color="error" onClick={() => dispatch(deleteRow(row.id))}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 1 }} />
      <TablePagination component="div" count={combinedRows.length} page={page} onPageChange={(_, p) => dispatch(setPage(p))} rowsPerPage={pageSize} onRowsPerPageChange={(e) => dispatch(setPageSize(parseInt(e.target.value, 10)))} rowsPerPageOptions={[5, 10, 25, 50]} />
    </Paper>
  )
}

function compareAny(a: any, b: any, direction: 'asc' | 'desc') {
  if (a == null && b == null) return 0
  if (a == null) return direction === 'asc' ? -1 : 1
  if (b == null) return direction === 'asc' ? 1 : -1
  const an = Number(a), bn = Number(b)
  const bothNumbers = !Number.isNaN(an) && !Number.isNaN(bn)
  if (bothNumbers) return direction === 'asc' ? an - bn : bn - an
  return direction === 'asc' ? String(a).localeCompare(String(b)) : String(b).localeCompare(String(a))
}

function castByType(columns: any[], field: string, value: string) {
  const col = columns.find((c) => c.field === field)
  if (!col) return value
  if (col.type === 'number') return value === '' ? '' : Number(value)
  return value
}
