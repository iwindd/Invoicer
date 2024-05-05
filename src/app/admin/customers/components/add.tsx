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
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from '@/libs/dayjs';

export interface AddDialogProps {
  onClose: () => void;
  open: boolean;
}

function AddDialog({ onClose, open }: AddDialogProps): React.JSX.Element {
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [joined, setJoined] = React.useState<Dayjs | null>(dayjs());
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(Schema)
  });

  const onSubmit = async (payload: Inputs) => {
    if (isLoading) return
    setLoading(true);
    const resp = await upsertCustomer(payload, undefined, joined);

    if (resp.state) {
      onClose()
      enqueueSnackbar("เพิ่มลูกค้าสำเร็จ!", { variant: "success" });
      await queryClient.refetchQueries({ queryKey: ['customers'], type: 'active' })
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
          เพิ่มลูกค้าใหม่
        </DialogTitle>
        <DialogContent >
          <Grid container sx={{ mt: 2 }} rowGap={1}>
            <Grid lg={6} sm={6} sx={{ px: 0.5 }}>
              <TextField
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
              <DatePicker
                label="วันที่เข้าร่วม"
                disabled={isLoading}
                value={joined}
                onChange={(newValue) => setJoined(newValue)}
                sx={{ width: '100%' }}
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