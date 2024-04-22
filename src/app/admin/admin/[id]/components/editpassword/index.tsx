import { useInterface } from '@/app/providers/InterfaceProvider';
import { useDialog } from '@/hooks/use-dialog';
import { EditTwoTone } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import React from 'react'
import { useForm } from 'react-hook-form';
import { Inputs, Schema } from '../schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { setAdminPassword } from '@/services/user';

export interface EditPasswordDialog {
  onClose: () => void;
  onOpen: () => void;
  open: boolean;
  id: number
}

const EditPasswordDialog = ({ onClose, onOpen, open, id }: EditPasswordDialog) => {
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(Schema)
  });

  const handleClose = (_: any, reason: any) => {
    if (reason !== 'backdropClick') {
      onClose()
    }
  }

  const onSubmit = async (payload : Inputs) => {
    try {
      setBackdrop(true);
      onClose()
      const resp = await setAdminPassword(payload.password, id)

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
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit(onSubmit),
      }}
    >
      <DialogTitle>แก้ไขรหัสผ่าน</DialogTitle>
      <DialogContent>
        <Grid container sx={{ mt: 2 }} rowGap={1}>
          <Grid lg={12} sm={12} sx={{ px: 0.5 }}>
            <TextField
              type="password"
              label="รหัสผ่าน"
              error={errors['password']?.message != undefined ? true : false}
              helperText={errors['password']?.message}
              {...register("password")}
              fullWidth
            />
          </Grid>
          <Grid lg={12} sm={12} sx={{ px: 0.5 }}>
            <TextField
              type="password"
              label="ยืนยันรหัสผ่าน"
              error={errors['confirmPassword']?.message != undefined ? true : false}
              helperText={errors['confirmPassword']?.message}
              {...register("confirmPassword")}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ปิด</Button>
        <Button type="submit">ยืนยัน</Button>
      </DialogActions>
    </Dialog>
  )
}

const EditPasswordController = ({ id }: { id: number }) => {
  const editDialog = useDialog<HTMLElement>();

  return (
    <>
      <Button
        startIcon={<EditTwoTone />}
        variant="text"
        color='inherit'
        onClick={editDialog.handleOpen}
      >
        รหัสผ่าน
      </Button>

      <EditPasswordDialog onClose={editDialog.handleClose} onOpen={editDialog.handleOpen} open={editDialog.open} id={id} />
    </>
  )
}

export default EditPasswordController