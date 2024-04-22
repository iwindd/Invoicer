import { Stack, Typography } from '@mui/material'
import React from 'react'
import InvoicePaper, { InvoicePaperProps } from './components/invoice'
import { getInvoice } from '@/services/invoice'
import { InvoicePrint } from './components/invoice';
import { notFound } from 'next/navigation';

const Invoice = async ({ params }: { params: { iid: string } }) => {
  const invoice = await getInvoice(Number(params.iid));

  if (!invoice.state) throw new Error("ERROR")
  if (!invoice.invoice) return notFound()

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3} alignItems={'center'}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">บิล</Typography>
        </Stack>
        <>
          <InvoicePrint invoice={invoice.invoice as InvoicePaperProps}/>
        </>
      </Stack>
      <Stack alignItems={'center'}>
        <InvoicePaper invoice={invoice.invoice as InvoicePaperProps} />
      </Stack>
    </Stack>
  )
}

export default Invoice