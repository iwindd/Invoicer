"use client";
import { AddTwoTone, DeleteTwoTone } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { DatePicker } from '@mui/x-date-pickers';
import * as formatter from '@/libs/formatter'
import React, { useEffect } from 'react'
import EditableInput from '../../../customers/[id]/components/EditableInput';
import dayjs, { Dayjs } from '@/libs/dayjs';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { InvoiceItem, upsertInvoice } from '@/services/invoice';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { InvoiceView } from '../../../customers/[id]/components/type';

export interface EditDialogProps {
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  invoice: InvoiceView | null;
}

const EditDialog = ({ onClose, onOpen, open, invoice : i_}: EditDialogProps) => {
  const handleClose = (_: any, reason: any) => {
    if (reason !== 'backdropClick') {
      onClose()
    }
  }

  const [invoice, setInvoice] = React.useState<InvoiceView | null>(null);
  const [note, setNote] = React.useState<string>("");
  const [items, setItems] = React.useState<InvoiceItem[]>([])
  const [start, setStart] = React.useState<Dayjs | null>(dayjs());
  const [end, setEnd] = React.useState<Dayjs | null>(dayjs());
  const [error, setError] = React.useState<string>("");
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    setInvoice(i_)
    if (i_ != null) {
      setNote(i_.note)
      setItems(JSON.parse(i_?.items as string))
      setStart(dayjs(i_?.start))
      setEnd(dayjs(i_?.end))
    }
  }, [i_, setInvoice])

  const onAddItem = () => {
    setItems((prev) => {
      return [...prev, { title: "รายการใหม่", amount: 1, price: 0 }]
    })
  }

  const onRemoveItem = (index: number) => setItems((prev) => prev.filter((_, idx) => idx !== index))

  const onItemChange = (index: number, name: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => {
      const updatedItems = [...prev];
      updatedItems[index] = { ...updatedItems[index], [name]: value };
      return updatedItems;
    });
  }

  const onSubmit = async (e: React.FormEvent<SubmitEvent>) => {
    e.preventDefault();

    try {
      setError("");
      if (items.length <= 0) return setError("ไม่พบรายการ!");
      if (start == null) return setError("วันที่เริ่มต้นไม่ถูกต้อง!");
      if (end == null) return setError("วันครบกำหนดไม่ถูกต้อง!");

      items.map((item) => {
        if (item.title == "") setError("กรุณาป้อนชื่อรายการให้ถูกต้อง!");
        if (item.amount <= 0) setError("กรุณาป้อนจำนวนให้ถูกต้อง!");
      })

      if (error != "") return

      setBackdrop(true);
      onClose();
      const resp = await upsertInvoice({ id: invoice?.id, items, note, start, end, owner: invoice?.ownerId as number})

      if (resp.state) {
        await queryClient.refetchQueries({ queryKey: ['invoices'], type: 'active' })
        await queryClient.refetchQueries({ queryKey: ['invoicesall'], type: 'active' })
        enqueueSnackbar("แก้ไขบิลสำเร็จแล้ว!", { variant: 'success' });
      } else {
        onOpen();
        setError("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง");
    } finally{
      setBackdrop(false)
    }
  }

  if (invoice == null) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      disableRestoreFocus
      PaperProps={{
        component: 'form',
        onSubmit: onSubmit,
      }}
    >
      <DialogTitle >
        แก้ไขบิล
      </DialogTitle>
      <DialogContent >
        <Stack sx={{ mt: 2 }}>
          <Grid container spacing={1}>
            <Grid lg={6} md={12} sm={12}>
              <TextField
                type='text'
                fullWidth
                label="หมายเหตุ"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Grid>
            <Grid lg={3} md={12} sm={12}>
              <DatePicker
                label="วันเริ่มต้น"
                sx={{ width: '100%' }}
                value={start}
                onChange={(newValue) => setStart(newValue)}
              />
            </Grid>
            <Grid lg={3} md={12} sm={12}>
              <DatePicker
                label="วันครบกำหนด"
                sx={{ width: '100%' }}
                value={end}
                minDate={start || dayjs()}
                onChange={(newValue) => setEnd(newValue)}
              />
            </Grid>
            <Grid lg={12}>
              <Stack direction="row" spacing={3} alignItems={'center'}>
                <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
                  <Typography variant="h6">รายการ</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid lg={12}>
              <Paper
                sx={{
                  maxHeight: 600,
                  overflow: 'hidden'
                }}
              >
                <TableContainer sx={{ maxHeight: 500, minHeight: 500 }} >
                  <Table stickyHeader size="small">
                    <TableHead >
                      <TableRow >
                        <TableCell >#</TableCell>
                        <TableCell align="right">รายการ</TableCell>
                        <TableCell align="right">จำนวน</TableCell>
                        <TableCell align="right">หน่วย</TableCell>
                        <TableCell align="right">รวม</TableCell>
                        <TableCell align="right">เครื่องมือ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        items.map((item, index) => {
                          return (
                            <TableRow key={index}>
                              <TableCell align='left'>{formatter.number(index + 1)}</TableCell>
                              <TableCell align='right'>
                                <EditableInput placeholder='ป้อนชื่อรายการ' type="text" value={item.title} onChange={(val) => onItemChange(index, 'title', val)} />
                              </TableCell>
                              <TableCell align='right'>
                                <EditableInput placeholder='ป้อนจำนวน' type="number" value={item.amount} onChange={(val) => onItemChange(index, 'amount', val)} />
                              </TableCell>
                              <TableCell align='right'>
                                <EditableInput placeholder='ป้อนหน่วย' type="number" value={item.price} onChange={(val) => onItemChange(index, 'price', val)} />
                              </TableCell>
                              <TableCell align='right'>{formatter.money(item.amount * item.price)}</TableCell>
                              <TableCell align='right'>
                                <IconButton onClick={() => onRemoveItem(index)} >
                                  <DeleteTwoTone />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      }
                      <TableRow>
                        <TableCell component="th" scope="row" colSpan={6} align='center' sx={{ p: 0 }}>
                          <Button onClick={onAddItem} startIcon={<AddTwoTone />} fullWidth sx={{ borderRadius: 0, m: 0 }}>เพิ่มรายการ</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component='th' colSpan={4} align='right'>ยอดรวม</TableCell>
                        <TableCell component='th' align='right'>
                          {
                            formatter.money(items.reduce((total, item) => total + (item.amount * item.price), 0))
                          }
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            {
              error != "" ? (
                <Grid lg={12}>
                  <Alert variant="filled" severity="error" sx={{ my: 1.5 }}>
                    {error}
                  </Alert>
                </Grid>
              ) : null
            }
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} >ยกเลิก</Button>
        <Button type='submit' > บันทึก </Button>
      </DialogActions>
    </Dialog>
  )
}


export default EditDialog