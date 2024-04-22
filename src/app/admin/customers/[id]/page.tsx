'use server';
import React from 'react'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import Datatable from './components/datatable'
import { Stack, Typography } from '@mui/material'
import AddController from './components/add'
import { getInvoicesAnalysis } from '@/services/invoice'
import * as formatter from '@/libs/formatter'
import { getCustomer } from '@/services/customer';
import { Customers } from '@prisma/client';
import dayjs from '@/libs/dayjs';
import { TotalInvoice } from '../../dashboard/stats/total';
import { TotalSuccessInvoice } from '../../dashboard/stats/success';
import { TotalProgressInvoice } from '../../dashboard/stats/progress';
import { TotalFailInvoice } from '../../dashboard/stats/fail';
import EditProfile from './components/editprofile';
import { notFound } from 'next/navigation';
import ApiController from './components/api';

const CustomerPage = async ({ params }: { params: { id: string } }) => {
  const customer = await getCustomer(Number(params.id));
  const analysis = await getInvoicesAnalysis(Number(params.id))

  if (!customer.state) throw new Error("ERROR");
  if (!customer.data) return notFound()

  const data = customer.data as Customers

  const stats = {
    success: analysis.data.filter(i => i.status == 1),
    cancel: analysis.data.filter(i => i.status == -1),
    pending: analysis.data.filter(i => i.status == 0 && dayjs().isBetween(dayjs(i.start), dayjs(i.end))),
    fail: analysis.data.filter(i => i.status == 0 && dayjs().isAfter(dayjs(i.end))),
  }

  return (
    <Grid container spacing={3}>
      <Grid lg={12} md={12} xs={12}>
        <Stack direction="row" spacing={3} alignItems={'center'}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">{data.firstname} {data.lastname} </Typography>
          </Stack>
          <>
            <ApiController />
            <AddController />
          </>
        </Stack>
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalInvoice sx={{ height: '100%' }} value={`${formatter.number(analysis.data.length)} รายการ`} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalSuccessInvoice sx={{ height: '100%' }} value={`${formatter.number(stats.success.length)} รายการ`} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProgressInvoice sx={{ height: '100%' }} value={`${formatter.number(stats.pending.length)} รายการ`} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalFailInvoice sx={{ height: '100%' }} value={`${formatter.number(stats.fail.length)} รายการ`} />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <Datatable />
      </Grid>
      <Grid lg={12} md={12} xs={12}>
        <EditProfile customer={data as Customers} />
      </Grid>
    </Grid>
  )
}

export default CustomerPage