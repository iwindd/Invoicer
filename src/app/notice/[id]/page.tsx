import React from "react";
import { getNoticeInvoice } from "@/services/invoice";
import { Container, Stack, Typography } from "@mui/material";
import { date2 } from "@/libs/formatter";
import { PaymentController } from "./component/PaymentDialog";
import { Invoice, Payment } from "@prisma/client";

const Notice = async ({ params }: { params: { id: string } }) => {
  const notice = await getNoticeInvoice(Number(params.id));

  if (!notice.state) return <p>error</p>;
  if (notice.data == null) return null;
  if (notice.data.length <= 0) return null;

  const invoices = notice.data;
  const noreport = invoices.filter((i) => i.status === 0);

  return (
    <Stack
      sx={{ height: "100vh" }}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Stack sx={{mb: 20}}>
        <Stack spacing={3} sx={{ pt: 5 }} alignItems={"center"}>
          <Typography 
            align="center" 
            variant="h1" 
            sx={{ typography: { 
              lg: 'h1', 
              md: 'h1', 
              sm: 'h3',
              xs: 'h4'
            }}}
          >
            {noreport.length > 0
              ? "โปรดตรวจสอบค่าบริการที่ต้องชำระ"
              : "กำลังรอแอดมินตรวจสอบค่าบริการ"}
          </Typography>
          {noreport.length > 0 && (
            <>
              <Typography align="center" variant="h6" >
                กรุณาชำระบริการก่อนวันที่ {date2(invoices[0].end)}
              </Typography>
              <Stack width={"fit-content"} sx={{ mb: 10 }}>
                <PaymentController
                  invoices={invoices as Invoice[]}
                  payment={notice.account as Payment}
                />
              </Stack>
            </>
          )}
        </Stack>
        {noreport.length > 0 && (
          <Stack alignItems={"center"}>
            <Typography textAlign={"center"} variant="caption" sx={{ mt: 2 }}>
              บริษัทฯ ขออภัยหากท่านได้ชำระค่าบริการดังกล่าวแล้ว
              ลองอีกครั้งในภายหลัง
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default Notice;
