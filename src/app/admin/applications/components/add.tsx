"use client";
import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { AddTwoTone } from '@mui/icons-material';
import { useDialog } from '@/hooks/use-dialog';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Inputs, Schema } from '../schema';
/* import { upsertApplication } from '@/services/application';

 */export interface AddDialogProps {
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
/*     const resp = await upsertApplication(payload, undefined);

    if (resp.state) {
      onClose()
      reset()
      enqueueSnackbar("เพิ่มแอดมินสำเร็จ!", { variant: "success" });
      await queryClient.refetchQueries({ queryKey: ['applications'], type: 'active' })
    } else {
      enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง", { variant: "error" })
    }
    setLoading(false); */
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
          เพิ่มแอพพลิเคชั่น
        </DialogTitle>
        <DialogContent >
          <Grid container sx={{ mt: 2 }} rowGap={1}>
            <Grid lg={12} sm={12} sx={{ px: 0.5 }}>
              <TextField
                type="text"
                label="ชื่อแอพพลิเคชั่น"
                autoFocus
                error={errors['title']?.message != undefined ? true : false}
                helperText={errors['title']?.message}
                {...register("title")}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
            <Grid lg={12} sm={12} sx={{ px: 0.5 }}>
              <TextField
                type="password"
                label="แจ้งเตือนไลน์"
                error={errors['token']?.message != undefined ? true : false}
                helperText={errors['token']?.message}
                {...register("token")}
                disabled={isLoading}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>ยกเลิก</Button>
          <Button type='submit' disabled={isLoading}> เพิ่มแอพพลิเคชั่น </Button>
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