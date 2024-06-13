import { ReceiptTwoTone } from "@mui/icons-material";
import {
  Avatar,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import type { SxProps } from "@mui/material/styles";
import * as React from "react";
import RouterLink from "next/link";
import { paths } from "@/paths";

export interface TotalCheckingInvoiceProps {
  sx?: SxProps;
  value: string;
}

export function TotalCheckingInvoice({
  value,
  sx,
}: TotalCheckingInvoiceProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              บิลที่กำลังรอตรวจสอบ
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar
            sx={{
              backgroundColor: "var(--mui-palette-primary-main)",
              height: "56px",
              width: "56px",
            }}
          >
            <ReceiptTwoTone />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
