'use client'
import React, { useRef } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DownloadIcon from '@mui/icons-material/Download'
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { useAppDispatch, useAppSelector } from '@/store'
import { importRows } from '@/store/tableSlice'

export function ImportExportButtons() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const dispatch = useAppDispatch()
  const { columns, rows } = useAppSelector((s) => s.table)
  const visibleFields = columns.filter((c) => c.visible).map((c) => c.field)

  const onImport = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data as any[]
        const headers = results.meta.fields || []
        if (!data || data.length === 0) {
          alert('CSV has no rows')
          return
        }
        const normalized = data.map((d, idx) => ({ id: d.id || `${idx + 1}-${Date.now()}`, ...d }))
        dispatch(importRows({ rows: normalized, columnsFromCSV: headers || [] }))
      },
      error: (err: any) => alert(`CSV parse error: ${err?.message ?? String(err)}`),
    })
  }

  const handleExport = () => {
    const header = visibleFields
    const body = rows.map((r) => header.map((h) => r[h] ?? ''))
    const csv = Papa.unparse({ fields: header, data: body })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'table_export.csv')
  }

  return (
    <Stack direction="row" spacing={1}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImport(file)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
      <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
        Import CSV
      </Button>
      <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
        Export CSV
      </Button>
    </Stack>
  )
}
