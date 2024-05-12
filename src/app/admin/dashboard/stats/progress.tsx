import { TimerTwoTone } from '@mui/icons-material';
import { Avatar, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import * as React from 'react';
export interface TotalProgressInvoiceProps {
  sx?: SxProps;
  value: string;
}

export function TotalProgressInvoice({ value, sx }: TotalProgressInvoiceProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              บิลที่กำลังดำเนินการ
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-light)', height: '56px', width: '56px' }}>
            <TimerTwoTone />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}