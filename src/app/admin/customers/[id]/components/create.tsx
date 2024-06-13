"use client";
import * as React from "react";
import { Button } from "@mui/material";
import { AddTwoTone, SettingsApplicationsTwoTone } from "@mui/icons-material";
import { useDialog } from "@/hooks/use-dialog";
import { Confirmation, useConfirm } from "@/hooks/use-confirm";
import { useInterface } from "@/app/providers/InterfaceProvider";
import { createApplication } from "@/services/application";
import { useParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { paths } from "@/paths";

export interface AddDialogProps {
  onClose: () => void;
  open: boolean;
}

const CreateController = () => {
  const { setBackdrop } = useInterface();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const createConfirmation = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "คุณต้องการที่จะสร้างแอพพลิเคชั่นหรือไม่?",
    onConfirm: async () => {
      try {
        setBackdrop(true);
        const resp = await createApplication(+id);

        if (!resp.state) throw Error("error");

        enqueueSnackbar("สร้างแอพพลิเคชั่นสาเร็จ", {variant: "success"});
        router.push(`${paths.admin.applications}/${resp.application}`);
        router.refresh();
      } catch (error) {
        enqueueSnackbar("มีบางอย่างผิดพลาดกรุณาลองใหม่อีกครั้งในภายหลัง", {variant: "error"});
      } finally {
        setBackdrop(false);
      }
    },
  });

  return (
    <>
      <Button
        startIcon={<SettingsApplicationsTwoTone />}
        variant="contained"
        color="info"
        onClick={createConfirmation.handleOpen}
      >
        สร้างแอพพลิเคชั่น
      </Button>

      <Confirmation {...createConfirmation.props} />
    </>
  );
};

export default CreateController;
