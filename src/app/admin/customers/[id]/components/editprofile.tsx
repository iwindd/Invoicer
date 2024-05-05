"use client";
import { CancelTwoTone, EditTwoTone, UpdateTwoTone } from '@mui/icons-material'
import { Button, Card, CardActions, CardHeader, Divider, TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2/Grid2'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Inputs, Schema } from '../../schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Customers } from '@prisma/client';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { upsertCustomer } from '@/services/customer';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import LineController from './line';
import dayjs, { Dayjs } from '@/libs/dayjs';
import { DatePicker } from '@mui/x-date-pickers';

interface EditProfileProps {
  customer: Customers
}

const EditProfile = ({ customer }: EditProfileProps) => {
  const [isEdit, setIsEdit] = React.useState<boolean>(false);
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [joined, setJoined] = React.useState<Dayjs | null>(dayjs(customer.joinedAt));

  const confirmation = useConfirm({
    title: "แจ้งเตือน",
    text: `คุณต้องการจะแก้ไข ${customer.firstname} ${customer.lastname} หรือไม่?`,
    onConfirm: async (data: Inputs) => {
      try {
        setBackdrop(true);
        const resp = await upsertCustomer(data, customer.id, joined)

        if (resp.state) {
          enqueueSnackbar("แก้ไขผู้ใช้สำเร็จ!", { variant: 'success' });
          setIsEdit(false);
        }
      } catch (error) {
        enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", { variant: 'error' });
      } finally {
        setBackdrop(false)
      }
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(Schema),
    defaultValues: {
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email
    }
  });

  const onSubmit = (payload: Inputs) => {
    confirmation.with(payload)
    confirmation.handleOpen()
  }

  return (
    <>
      <Card>
        <CardHeader
          title="ลูกค้า"
          action={<LineController customer={customer} />}
        />
        <Divider />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid sm={12} md={6} lg={3}>
              <TextField
                type="text"
                label="ชื่อ"
                autoFocus
                error={errors['firstname']?.message != undefined ? true : false}
                helperText={errors['firstname']?.message}
                {...register("firstname")}
                fullWidth
                disabled={!isEdit}
              />
            </Grid>
            <Grid sm={12} md={6} lg={3}>
              <TextField
                type="text"
                label="นามสกุล"
                error={errors['lastname']?.message != undefined ? true : false}
                helperText={errors['lastname']?.message}
                {...register("lastname")}
                fullWidth
                disabled={!isEdit}
              />
            </Grid>
            <Grid sm={12} md={12} lg={6}>
              <TextField
                type="email"
                label="อีเมล"
                error={errors['email']?.message != undefined ? true : false}
                helperText={errors['email']?.message}
                {...register("email")}
                fullWidth
                disabled={!isEdit}
              />
            </Grid>
            <Grid sm={12} md={6} lg={3}>
              <DatePicker
                label="วันที่เข้าร่วม"
                disabled={!isEdit}
                value={joined}
                onChange={(newValue) => setJoined(newValue)}
                sx={{ width: '100%' }}
              />
            </Grid>
          </Grid>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            {
              !isEdit ? (
                <>
                  <Button
                    color="inherit"
                    endIcon={<EditTwoTone />}
                    size="small"
                    variant="text"
                    onClick={() => setIsEdit(!isEdit)}
                  >
                    แก้ไข
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    endIcon={<CancelTwoTone />}
                    size="small"
                    variant="text"
                    onClick={() => setIsEdit(!isEdit)}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    color="primary"
                    endIcon={<UpdateTwoTone />}
                    size="small"
                    variant="contained"
                    type='submit'
                  >
                    อัพเดท
                  </Button>
                </>
              )
            }
          </CardActions>
        </form>
      </Card >
      <Confirmation {...confirmation.props} />
    </>
  )
}

export default EditProfile