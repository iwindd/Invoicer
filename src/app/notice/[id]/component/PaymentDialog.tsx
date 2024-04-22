"use client";
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useDialog } from '@/hooks/use-dialog';
import { date2, money, number } from '@/libs/formatter';
import { InvoiceItem, setInvoicePayment } from '@/services/invoice';
import { CloudUploadTwoTone, PaymentTwoTone, ReceiptTwoTone } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Radio, RadioGroup, Stack, styled, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Invoice, Payment } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import React, { ChangeEvent } from 'react'

interface PaymentDialogProps {
  onClose: () => void;
  open: boolean;
  invoices: Invoice[];
  payment: Payment
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const PaymentDialog = ({ onClose, open, invoices, payment }: PaymentDialogProps) => {
  const [image, setImage] = React.useState<File | null>(null);
  const [selectInvoice, setSelectInvoice] = React.useState<number>(invoices[0].id);
  const { id } = useParams();
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const onSubmit = async (e: HTMLFormElement) => {
    e.preventDefault()
    if (!image) return;

    try {
      setBackdrop(true);
      onClose();
      const formData = new FormData();
      formData.append("_method", "patch");
      formData.append("image", image);
      const resp = await setInvoicePayment(selectInvoice, formData);
      if (!resp?.state) {
        enqueueSnackbar("แจ้งชำระเงินสำเร็จ!", { variant: "success" });
      } else {
        enqueueSnackbar("เกิดข้อผิดพลาดไม่สามารถชำระเงินได้ในขณะนี้", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("เกิดข้อผิดพลาดไม่สามารถชำระเงินได้ในขณะนี้", { variant: "error" });
    } finally {
      setBackdrop(false);
      router.refresh();
    }
  }

  const onUploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files ? e.target.files[0] : null;
    setImage(image);
  }

  const onSelectInvoice = (id: number) => setSelectInvoice(id)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      PaperProps={{
        component: 'form',
        onSubmit: onSubmit,
      }}
    >
      <DialogTitle > รายการบิล </DialogTitle>
      <DialogContent >
        <Stack spacing={1} sx={{ mt: 2, px: 2 }}>
          <Stack>
            <Grid container>
              <Grid xs={4} ><Typography variant='subtitle1'>ธนาคาร</Typography></Grid>
              <Grid xs={8} ><Typography variant='body1'>{payment.title}</Typography></Grid>
              <Grid xs={4} ><Typography variant='subtitle1'>หมายเลขบัญชี</Typography></Grid>
              <Grid xs={8} ><Typography variant='body1'>{payment.account}</Typography></Grid>
              <Grid xs={4} ><Typography variant='subtitle1'>ชื่อบัญชี</Typography></Grid>
              <Grid xs={8} ><Typography variant='body1'>{payment.name}</Typography></Grid>
            </Grid>
          </Stack>

          <RadioGroup value={selectInvoice} >
            <List dense sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {invoices.filter((i) => i.status == 0).map((invoice) => {

                const items = JSON.parse(invoice.items as string) as InvoiceItem[];
                const total = items.reduce((v, i) => v + (i.amount * i.price), 0)

                return (
                  <ListItem
                    key={invoice.id}
                    sx={{ px: 0 }}
                  >
                    <ListItemButton
                      onClick={() => onSelectInvoice(invoice.id)}
                      sx={{
                        outline: '2px',
                        outlineStyle: 'solid',
                        outlineColor: selectInvoice == invoice.id ? `var(--mui-palette-primary-main)` : `var(--mui-palette-divider)`,
                        borderRadius: 1,
                        boxShadow: 1
                      }}
                    >
                      <ListItemIcon>
                        <ReceiptTwoTone />
                      </ListItemIcon>
                      <ListItemText primary={`หมายเลขใบแจ้งหนี้ #${number(invoice.id)}`} secondary={`กำหนดชำระ ${date2(invoice.end)}`} />
                      <Typography>{money(total)}</Typography>
                      <Radio
                        value={invoice.id}
                        id={`invoice-${id}-radio`}
                        sx={{ display: 'none' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </RadioGroup>

          <Button
            component="label"
            variant="contained"
            color={!image ? "primary" : "secondary"}
            tabIndex={-1}
            startIcon={<CloudUploadTwoTone />}
          >
            {
              !image ? "อัพโหลดใบเสร็จ" : image.name
            }
            <VisuallyHiddenInput accept='image/*' type="file" name="image" onChange={onUploadFile} />
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} >ปิด</Button>
        <Button type='submit' > ชำระค่าบริการ </Button>
      </DialogActions>
    </Dialog>
  )
}

export const PaymentController = (props: { invoices: Invoice[], payment: Payment }) => {
  const paymentDialog = useDialog<HTMLElement>()

  return (
    <>
      <Button
        variant='contained'
        onClick={paymentDialog.handleOpen}
        startIcon={<PaymentTwoTone />}
      >
        ชำระค่าบริการ
      </Button>

      <PaymentDialog onClose={paymentDialog.handleClose} open={paymentDialog.open} {...props} />
    </>
  )
}

export default PaymentDialog