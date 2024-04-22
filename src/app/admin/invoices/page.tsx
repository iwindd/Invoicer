import { Stack, Typography } from '@mui/material'
import React from 'react'
import Datagrid from './components/datagrid'

const Invoices = () => {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">บิลทั้งหมด</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}></Stack>
        </Stack>
      </Stack>
      <Datagrid/>
    </Stack>
  )
}

export default Invoices