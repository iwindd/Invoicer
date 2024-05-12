import { PendingTwoTone } from '@mui/icons-material';
import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import * as React from 'react';

export interface TotalPendingInvoiceProps {
  sx?: SxProps;
  value: string;
}

export function TotalPendingInvoice({ value, sx }: TotalPendingInvoiceProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              บิลที่ยังรอกำหนดการ
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-info-main)', height: '56px', width: '56px' }}>
            <PendingTwoTone />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}