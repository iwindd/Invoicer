import { Stack, Typography } from '@mui/material'
import React from 'react'
import Datagrid from './components/datagrid'
import AddController from './components/add'

const Applications = () => {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">แอพพลิเคชั่น</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}></Stack>
        </Stack>
        <>
          <AddController/>
        </>
      </Stack>
      <Datagrid />
    </Stack>
  )
}

export default Applications