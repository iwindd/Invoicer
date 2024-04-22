"use client";
import { InvoiceItem, } from '@/services/invoice'
import { Box, Button, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Customers, Invoice } from '@prisma/client'
import * as formatter from '@/libs/formatter'
import React from 'react'
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useReactToPrint } from 'react-to-print';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { PrintTwoTone } from '@mui/icons-material';

export interface InvoicePaperProps extends Invoice {
  owner: Customers
}

const InvoicePaper = React.forwardRef<HTMLDivElement, { invoice: InvoicePaperProps }>(({ invoice }, ref) => {
  const items = (JSON.parse(invoice.items as string) as InvoiceItem[]);
  return (
    <Stack
      ref={ref}
      spacing={3}
      sx={{
        width: '8.5in',
        height: 'auto',
        boxShadow: 20,
        py: '0.7in',
        pl: '0.55in',
        pr: '0.4in',
        border: 0
      }}
    >
      <Stack alignItems={"flex-end"}>
        <Typography variant='h1' align='right' sx={{ textTransform: "uppercase", fontWeight: '200' }}>Invoice</Typography>
        <Typography variant='caption' align='right'>#{formatter.number(invoice.id)}</Typography>
      </Stack>
      <Stack>
        <Grid container>
          <Grid xs={2} ><Typography variant='subtitle1'>BILLED TO :</Typography></Grid>
          <Grid xs={4} ><Typography variant='body1'>{invoice.owner.firstname} {invoice.owner.lastname}</Typography></Grid>
        </Grid>
      </Stack>
      <Stack>
        <TableContainer>
          <Table>
            <TableHead >
              <TableRow>
                <TableCell align="left">รายการ</TableCell>
                <TableCell align="right">จำนวน</TableCell>
                <TableCell align="right">หน่วย</TableCell>
                <TableCell align="right">รวม</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                items.map((item, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell align='left'>
                        <Typography>{item.title}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography>{formatter.number(item.amount)}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography>{formatter.number(item.price)}</Typography>
                      </TableCell>
                      <TableCell align='right'>{formatter.money(item.amount * item.price)}</TableCell>
                    </TableRow>
                  )
                })
              }
              <TableRow>
                <TableCell component='th' colSpan={3} align='left'>ยอดรวม</TableCell>
                <TableCell component='th' align='right'>
                  {
                    formatter.money(items.reduce((total, item) => total + (item.amount * item.price), 0))
                  }
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
      <Stack alignItems={'center'} sx={{ mt: 3 }}>
        <Typography sx={{ textTransform: 'uppercase' }}>Thank you</Typography>
      </Stack>
    </Stack>
  )
})

InvoicePaper.displayName = 'InvoicePaper';

export const InvoicePrint = ({ invoice }: { invoice: InvoicePaperProps }) => {
  const receipterRef = React.useRef(null);
  const { setBackdrop } = useInterface();
  const handlePrint = useReactToPrint({
    documentTitle: "บิล",
    onBeforePrint: () => setBackdrop(true),
    onAfterPrint: () => setBackdrop(false),
    removeAfterPrint: true,
  });


  const ReceiptExport = () => {
    handlePrint(null, () => receipterRef.current);
  }

  const WaitToExport = () => {
    if (receipterRef.current) {
      handlePrint(null, () => receipterRef.current);
    } else {
      setTimeout(WaitToExport, 1)
    }
  }

  return (
    <>
      <Button startIcon={<PrintTwoTone />} onClick={ReceiptExport} variant="contained" >พิมพ์</Button>
      <Box
        sx={{ display: 'none' }}
      >
        <InvoicePaper ref={receipterRef} invoice={invoice} />
      </Box>
    </>
  )
}

export default InvoicePaper