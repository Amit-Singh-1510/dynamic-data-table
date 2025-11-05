'use client'
import React from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import { DataTable } from '@/components/DataTable'
import { ManageColumnsModal } from '@/components/ManageColumnsModal'
import { ImportExportButtons } from '@/components/ImportExportButtons'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Page() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'start', sm: 'center' }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Dynamic Data Table Manager
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <ThemeToggle />
            <ManageColumnsModal />
            <ImportExportButtons />
          </Stack>
        </Stack>
      </Paper>
      <Divider sx={{ mb: 2 }} />
      <DataTable />
    </Container>
  )
}
