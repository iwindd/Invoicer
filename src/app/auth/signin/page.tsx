"use client"
import React from 'react'
import { signIn, useSession } from "next-auth/react";
import { Box, Button, Container, Divider, Grid, TextField, Typography } from '@mui/material';
import { LoginTwoTone } from '@mui/icons-material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Inputs, Schema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInterface } from '../../providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { useRouter, useSearchParams } from 'next/navigation';
import Loading from '@/components/loading';

function SignIn() {
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: zodResolver(Schema)
  });
  const router = useRouter();
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useSession();
  const params = useSearchParams();

  const onSubmit: SubmitHandler<Inputs> = async (payload: Inputs) => {
    setBackdrop(true)
    const resp = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      token: "--",
      redirect: false
    })

    console.log(resp);
    
    setBackdrop(false)
    if (!resp?.error) {
      enqueueSnackbar("เข้าสู่ระบบสำเร็จแล้ว!", { variant: "success" })
      router.push("/")
    } else {
      resetField("password");

      if (resp.status == 401) {
        setError("email", { type: "string", message: "ไม่พบผู้ใช้งาน" }, {
          shouldFocus: true
        })
      }
    }
  }

  if (data == undefined && data != null) return <Loading centered m={2} />

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 6 }} >
        {
          !data ? (
            <>
              <form onSubmit={handleSubmit(onSubmit)} >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant='h4'>เข้าสู่ระบบ</Typography>
                    <Divider sx={{ mt: 2 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="email"
                      label="อีเมล"
                      error={errors['email']?.message != undefined ? true : false}
                      helperText={errors['email']?.message}
                      {...register("email")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="รหัสผ่าน"
                      error={errors['password']?.message != undefined ? true : false}
                      helperText={errors['password']?.message}
                      {...register("password")}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      color='primary'
                      type='submit'
                      endIcon={< LoginTwoTone />} >
                      เข้าสู่ระบบ
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </>
          ) : (null)
        }
      </Box>
    </Container>
  )
}

export default SignIn