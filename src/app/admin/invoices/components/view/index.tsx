"use client";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, styled } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import * as formatter from '@/libs/formatter'
import React from 'react'
import dayjs from '@/libs/dayjs';
import { InvoiceItem, setInvoicePaymentStatus } from '@/services/invoice';
import { condition } from '@/libs/utils';
import { InvoiceView } from '../../../customers/[id]/components/type';
import Image from 'next/image';
import { useConfirm } from '@/hooks/use-confirm';
import { ConfirmationDialog } from '@/components/core/dialog/confirmation';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';

export interface ViewDialogProps {
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  invoice: InvoiceView | null
}

const ViewDialog = ({ onClose, onOpen, open, invoice }: ViewDialogProps) => {
  if (invoice == null) return;

  const invoiceItems = (JSON.parse(invoice.items as string) as InvoiceItem[])
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const confirmation = useConfirm({
    title: "", text: "",
    onConfirm: async (action: boolean) => {
      try {
        confirmation.handleClose();
        onClose();
        setBackdrop(true);
  
        const resp = await setInvoicePaymentStatus(invoice.id, action ? 1 : 0);
  
        if (resp.state) {
          enqueueSnackbar("จัดการบิลเรียบร้อยแล้ว", {variant: "success"})
          await queryClient.refetchQueries({ queryKey: ['invoices'], type: 'active' })
          await queryClient.refetchQueries({ queryKey: ['invoicesall'], type: 'active' })
        }else{
          enqueueSnackbar("กรุณาลองอีกครั้งภายหลัง", {variant: "error"})
        }
      } catch (error) {
        enqueueSnackbar("กรุณาลองอีกครั้งภายหลัง", {variant: "error"})
      } finally {
        setBackdrop(false)
      }
    }
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { setBackdrop } = useInterface();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { enqueueSnackbar } = useSnackbar();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const queryClient = useQueryClient();

  const OnAction = (action: boolean) => {
    if (invoice.status != 2) return;
    confirmation.setTitle("จัดการบิล")
    if (action) {
      confirmation.setText("คุณแน่ใจที่จะอนุมัติบิลนี้หรือไม่?")
    } else {
      confirmation.setText("คุณแน่ใจที่จะปฎิเสธบิลนี้หรือไม่?")
    }

    onClose();
    confirmation.with(action);
    confirmation.handleOpen();
  }

  const OnActionClose = () => {
    confirmation.handleClose();
    onOpen()
  }

  const Detail = () => {
    return (
      <Grid container spacing={1}>
        <Grid lg={6} md={12} sm={12}>
          <TextField type='text' fullWidth label="หมายเหตุ" value={formatter.text(invoice.note)} disabled />
        </Grid>
        <Grid lg={3} md={12} sm={12}>
          <TextField label="วันเริ่มต้น" fullWidth value={formatter.date2(invoice.start)} disabled />
        </Grid>
        <Grid lg={3} md={12} sm={12}>
          <TextField label="วันครบกำหนด" fullWidth value={formatter.date2(invoice.end)} disabled />
        </Grid>
        <Grid lg={6} md={12} sm={12}>
          <TextField label="เพิ่มโดย" fullWidth value={formatter.text(`${invoice.createdBy.firstname} ${invoice.createdBy.lastname}`)} disabled />
        </Grid>
        <Grid lg={3} md={12} sm={12}>
          <TextField label="สถานะ" fullWidth value={condition(invoice.status, { 0: "กำลังดำเนินการ", 1: "ชำระแล้ว", 2: "เลยกำหนด" }, 'ถูกยกเลิก')} disabled />
        </Grid>
        <Grid lg={3} md={12} sm={12}>
          <TextField label="ระยะเวลา" fullWidth value={dayjs(invoice.end).diff(invoice.start, "days") + " วัน"} disabled />
        </Grid>
        <Grid lg={12}>
          <Stack direction="row" spacing={3} alignItems={'center'}>
            <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
              <Typography variant="h6">รายการ</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid lg={12}>
          <Paper sx={{ maxHeight: 600, overflow: 'hidden' }} >
            <TableContainer sx={{ maxHeight: 500, minHeight: 500 }} >
              <Table stickyHeader size="small">
                <TableHead >
                  <TableRow >
                    <TableCell >#</TableCell>
                    <TableCell align="right">รายการ</TableCell>
                    <TableCell align="right">จำนวน</TableCell>
                    <TableCell align="right">หน่วย</TableCell>
                    <TableCell align="right">รวม</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    invoiceItems.map((item, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell align='left'>{formatter.number(index + 1)}</TableCell>
                          <TableCell align='right'>
                            <Typography />{item.title}<Typography />
                          </TableCell>
                          <TableCell align='right'>
                            <Typography />{item.amount}<Typography />
                          </TableCell>
                          <TableCell align='right'>
                            <Typography />{item.price}<Typography />
                          </TableCell>
                          <TableCell align='right'>{formatter.money(item.amount * item.price)}</TableCell>
                        </TableRow>
                      )
                    })
                  }
                  <TableRow>
                    <TableCell component='th' colSpan={4} align='right'>ยอดรวม</TableCell>
                    <TableCell component='th' align='right'>
                      {
                        formatter.money(invoiceItems.reduce((total, item) => total + (item.amount * item.price), 0))
                      }
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={invoice.status == 2 ? "xl" : "lg"}
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle >
          รายละเอียด
        </DialogTitle>
        <DialogContent >
          <Stack sx={{ mt: 2 }}>
            <Grid container>
              <Grid lg={(invoice.status == 2 || invoice.status == 1) ? 8 : 12} >
                <Detail />
              </Grid>
              <Grid sx={{ display: (invoice.status == 2 || invoice.status == 1) ? 'block' : 'none' }} lg={4}>
                <Stack sx={{ width: '100%', height: '100%', overflow: 'hidden', px: 2 }} gap={2} >
                  <Stack style={{ width: 'auto', height: 610, overflow: 'scroll' }} >
                    <Image
                      src={`/api/image/${invoice.image}`}
                      alt="Receipt"
                      width={500}
                      height={500}
                      style={{
                        width: 'auto',
                        height: 'auto',
                        objectFit: "cover",
                        objectPosition: "center"
                      }}
                    />
                  </Stack>
                  <Stack sx={{ display: (invoice.status == 2) ? 'block' : 'none' }} flexDirection={'row'} justifyContent={'space-between'}>
                    <Button variant='text' color='error' onClick={() => OnAction(false)}>ปฏิเสธ</Button>
                    <Button variant='contained' color='primary' onClick={() => OnAction(true)}>อนุมัติ</Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} >ปิด</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog {...confirmation.props} onClose={OnActionClose} />
    </>
  )
}

export default ViewDialog