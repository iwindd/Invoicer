import { useInterface } from '@/app/providers/InterfaceProvider';
import { useDialog } from '@/hooks/use-dialog';
import { lineConnect } from '@/services/customer';
import { EditTwoTone, SyncTwoTone } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { Customers } from '@prisma/client';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React from 'react'

export interface LineDialogProps {
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  customer: Customers
}

const LineDialog = ({ onClose, onOpen, open, customer }: LineDialogProps) => {
  const [token, setToken] = React.useState<string>(customer.lineToken);
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const handleClose = (_: any, reason: any) => {
    if (reason !== 'backdropClick') {
      onClose()
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setBackdrop(true);
      onClose()
      const resp = await lineConnect(customer.id, token)

      if (resp.state) {
        enqueueSnackbar("สำเร็จ!", { variant: 'success' });
      } else {
        onOpen()
        enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", { variant: 'error' });
      }
    } catch (error) {
      onOpen()
      enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", { variant: 'error' });
    } finally {
      setBackdrop(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: onSubmit,
      }}
    >
      <DialogTitle>Line Notification</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ใส่ Line Token เพื่อแจ้งเตือนไลน์ของลูกค้าเกี่ยวกับรายละเอียดของบิล เช่นวันใกล้ครบกำหนดเป็นต้น
        </DialogContentText>
        <TextField
          margin="dense"
          label="Line Token"
          type="text"
          fullWidth
          value={token}
          onChange={(e) => setToken(e.target.value)}
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ปิด</Button>
        <Button type="submit">ยืนยัน</Button>
      </DialogActions>
    </Dialog>
  )
}

const LineController = ({ customer }: { customer: Customers }) => {
  const lineDialog = useDialog<HTMLElement>();

  return (
    <>
      <Button
        startIcon={customer.lineToken == "" ? <SyncTwoTone /> : <EditTwoTone />}
        variant="text"
        color='inherit'
        onClick={lineDialog.handleOpen}
      >
        LINE
      </Button>

      <LineDialog onClose={lineDialog.handleClose} onOpen={lineDialog.handleOpen} open={lineDialog.open} customer={customer} />
    </>
  )
}

export default LineController