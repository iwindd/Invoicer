"use client";
import { useInterface } from '@/app/providers/InterfaceProvider';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { paths } from '@/paths';
import { signInAsApplication } from '@/services/application';
import { LoginTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import React from 'react'

const LoginController = () => {
  const { setBackdrop } = useInterface();
  const { id } = useParams();
  const router = useRouter();
  const {enqueueSnackbar} = useSnackbar();
  const createConfirmation = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "คุณต้องการจะเข้าสู่ระบบในฐานะลูกค้าหรือไม่? หากคุณเข้าสู่ระบบในฐานะลูกค้าระบบจะทำการออกจากระบบและจำเป็นต้องเข้าสู่ระบบอีกครั้งในบัญชีนี้!",
    onConfirm: async () => {
      try {
        setBackdrop(true)
        const resp = await signInAsApplication(+id);
        if (!resp.state) throw Error("error");

        const result = await signIn("credentials", {
          redirect: false,
          token: resp.token,
          email: resp.email,
          password: "--"
        })

        if (!result?.error) {
          router.push(paths.admin.overview);
          router.refresh();
          enqueueSnackbar("เข้าสู่ระบบในฐานะลูกค้าสำเร็จ!", {variant: "success"});
        }else{
          throw Error("error");
        }
      } catch (error) {
        enqueueSnackbar("มีบางอย่างผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", {variant: "error"});
      } finally{
        setBackdrop(false)
      }
    },
  });

  return (
    <>
      <Button
        startIcon={<LoginTwoTone />}
        variant="contained"
        color="primary"
        onClick={createConfirmation.handleOpen}
      >
        เข้าสู่ระบบในฐานะลูกค้า
      </Button>

      <Confirmation {...createConfirmation.props} />
    </>
  );
}

export default LoginController