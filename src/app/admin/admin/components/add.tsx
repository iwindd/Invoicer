"use client";
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { Inputs, Schema } from '../schema';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { AddTwoTone } from '@mui/icons-material';
import { useDialog } from '@/hooks/use-dialog';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { upsertCustomer } from '@/services/customer';
import { upsertAdmin } from '@/services/user';

export interface AddDialogProps {
  onClose: () => void;
  open: boolean;
}

function AddDialog({ onClose, open }: AddDialogProps): React.JSX.Element {
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<Inputs>({
    resolver: zodResolver(Schema)
  });

  const onSubmit = async (payload: Inputs) => {
    if (isLoading) return
    setLoading(true);
    const resp = await upsertAdmin(payload);

    if (resp.state) {
      onClose()
      reset()
      enqueueSnackbar("เพิ่มแอดมินสำเร็จ!", { variant: "success" });
      await queryClient.refetchQueries({ queryKey: ['admins'], type: 'active' })
    } else {
      enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง", { variant: "error" })
    }
    setLoading(false);
  }

  const handleClose = (_: any, reason: any) => {
    if (reason !== 'backdropClick') {
      onClose()
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        PaperProps={{
          component: 'form',
          onSubmit: handleSubmit(onSubmit),
        }}
      >
        <DialogTitle >
          เพิ่มแอดมิน
        </DialogTitle>
        <DialogContent >
          <Grid container sx={{ mt: 2 }} rowGap={1}>
            <Grid lg={6} sm={6} sx={{ px: 0.5 }}>
              <TextField
                type="text"
                label="ชื่อ"
                autoFocus
                error={errors['firstname']?.message != undefined ? true : false}
                helperText={errors['firstname']?.message}
                {...register("firstname")}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid lg={6} sm={6} sx={{ px: 0.5 }}>
              <TextField
                type="text"
                label="นามสกุล"
                error={errors['lastname']?.message != undefined ? true : false}
                helperText={errors['lastname']?.message}
                {...register("lastname")}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid lg={12} sm={12} sx={{ px: 0.5 }}>
              <TextField
                type="email"
                label="อีเมล"
                error={errors['email']?.message != undefined ? true : false}
                helperText={errors['email']?.message}
                {...register("email")}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid lg={12} sm={12} sx={{ px: 0.5 }}>
              <TextField
                type="password"
                label="รหัสผ่าน"
                error={errors['password']?.message != undefined ? true : false}
                helperText={errors['password']?.message}
                {...register("password")}
                disabled={isLoading}
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
                disabled={isLoading}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>ยกเลิก</Button>
          <Button type='submit' disabled={isLoading}> เพิ่มรายการใหม่ </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const AddController = () => {
  const addDialog = useDialog<HTMLDivElement>();

  return (
    <>
      <Button startIcon={<AddTwoTone />} variant="contained" onClick={addDialog.handleOpen}>
        เพิ่มรายการ
      </Button>

      <AddDialog onClose={addDialog.handleClose} open={addDialog.open} />
    </>
  )
}

export default AddController