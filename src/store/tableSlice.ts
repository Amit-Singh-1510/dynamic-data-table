import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit'
import type { ColumnDef, RowItem, SortModel } from '@/types'

const initialColumns: ColumnDef[] = [
  { field: 'name', headerName: 'Name', type: 'string', visible: true, width: 200, editable: true },
  { field: 'email', headerName: 'Email', type: 'email', visible: true, width: 240, editable: true },
  { field: 'age', headerName: 'Age', type: 'number', visible: true, width: 120, editable: true },
  { field: 'role', headerName: 'Role', type: 'string', visible: true, width: 160, editable: true },
]

const demoRows: RowItem[] = [
  { id: nanoid(), name: 'Aarav Sharma', email: 'aarav@example.com', age: 26, role: 'Engineer' },
  { id: nanoid(), name: 'Neha Verma', email: 'neha@example.com', age: 29, role: 'Designer' },
  { id: nanoid(), name: 'Rahul Gupta', email: 'rahul@example.com', age: 33, role: 'Manager' },
  { id: nanoid(), name: 'Priya Iyer', email: 'priya@example.com', age: 24, role: 'Engineer' },
]

interface TableState {
  columns: ColumnDef[]
  rows: RowItem[]
  search: string
  sort: SortModel | null
  page: number
  pageSize: number
}

const initialState: TableState = {
  columns: initialColumns,
  rows: demoRows,
  search: '',
  sort: null,
  page: 0,
  pageSize: 10,
}

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload
      state.page = 0
    },
    setSort(state, action: PayloadAction<SortModel | null>) {
      state.sort = action.payload
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload
    },
    addRow(state) {
      const newRow: RowItem = { id: nanoid() }
      state.columns.forEach((c) => {
        if (c.field !== 'id') newRow[c.field] = ''
      })
      state.rows.unshift(newRow)
    },
    addCustomRow(state, action: PayloadAction<RowItem>) {
      state.rows.unshift(action.payload)
    },
    updateCell(state, action: PayloadAction<{ id: string; field: string; value: any }>) {
      const row = state.rows.find((r) => r.id === action.payload.id)
      if (row) row[action.payload.field] = action.payload.value
    },
    deleteRow(state, action: PayloadAction<string>) {
      state.rows = state.rows.filter((r) => r.id !== action.payload)
    },

    // ✅ Fixed CSV Import logic
    importRows(state, action: PayloadAction<{ rows: RowItem[]; columnsFromCSV: string[] }>) {
      const csvCols = action.payload.columnsFromCSV

      // Normalize columns (trim, lowercase, replace spaces)
      const normalizedCols = csvCols
        .filter((c) => !!c)
        .map((field) => ({
          field: field.trim().toLowerCase().replace(/\s+/g, '_'),
          headerName: field.trim(),
        }))

      // Add missing columns
      normalizedCols.forEach(({ field, headerName }) => {
        if (field !== 'id' && !state.columns.some((c) => c.field === field)) {
          state.columns.push({
            field,
            headerName,
            type: field === 'age' ? 'number' : 'string',
            visible: true,
            editable: true,
            width: 180,
          })
        }
      })

      // Normalize each imported row
      const cleanedRows = action.payload.rows.map((row) => {
        const newRow: any = { id: row.id || nanoid() }
        normalizedCols.forEach(({ field }) => {
          const foundKey =
            Object.keys(row).find(
              (k) => k.trim().toLowerCase().replace(/\s+/g, '_') === field
            ) || field
          const rawValue = row[foundKey] ?? ''
          // Cast numbers when target column is numeric
          const targetCol = state.columns.find((c) => c.field === field)
          if (targetCol && targetCol.type === 'number') {
            newRow[field] = rawValue === '' ? '' : Number(rawValue)
          } else {
            newRow[field] = rawValue
          }
        })
        return newRow
      })

      state.rows = cleanedRows
      state.page = 0
    },
    // Add a new custom column
    addColumn(state, action: PayloadAction<{ headerName: string; field: string; type?: 'string' | 'number' | 'email' }>) {
      const { headerName, field, type = 'string' } = action.payload
      if (!state.columns.some((c) => c.field === field)) {
        state.columns.push({ field, headerName, type, visible: true, editable: true, width: 180 })
      }
    },
    // Toggle visibility of a column
    toggleColumnVisibility(state, action: PayloadAction<{ field: string; visible: boolean }>) {
      const col = state.columns.find((c) => c.field === action.payload.field)
      if (col) col.visible = action.payload.visible
    },
  },
})

export const {
  setSearch,
  setSort,
  setPage,
  setPageSize,
  addRow,
  addCustomRow,
  updateCell,
  deleteRow,
  importRows,
  addColumn,
  toggleColumnVisibility,
} = tableSlice.actions


export default tableSlice.reducer
