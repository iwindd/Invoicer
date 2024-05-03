import { AccessAlarmTwoTone } from '@mui/icons-material';
import { Avatar, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import * as React from 'react';
import RouterLink from 'next/link';
import { paths } from '@/paths';

export interface TotalNearInvoiceProps {
  sx?: SxProps;
  value: string;
}

export function TotalNearInvoice({ value, sx }: TotalNearInvoiceProps): React.JSX.Element {
  return (
    <Link
      underline="none"
      component={RouterLink}
      href={`${paths.admin.invoice}?fStatus=3`}
    >
      <Card sx={sx}>
        <CardContent>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                บิลที่ใกล้จะครบกำหนด
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-warning-main)', height: '56px', width: '56px' }}>
              <AccessAlarmTwoTone />
            </Avatar>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}