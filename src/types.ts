export type CellType = 'string' | 'number' | 'email'

export interface ColumnDef {
  field: string
  headerName: string
  type: CellType
  visible: boolean
  width?: number
  editable?: boolean
}

export interface RowItem {
  id: string
  [key: string]: any
}

export interface SortModel {
  field: string
  direction: 'asc' | 'desc'
}
