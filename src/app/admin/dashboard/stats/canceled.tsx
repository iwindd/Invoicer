import { CancelTwoTone } from '@mui/icons-material';
import { Avatar, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import * as React from 'react';
import RouterLink from 'next/link';
import { paths } from '@/paths';

export interface TotalCanceledInvoiceProps {
  sx?: SxProps;
  value: string;
}

export function TotalCanceledInvoice({ value, sx }: TotalCanceledInvoiceProps): React.JSX.Element {
  return (
    <Link
      underline="none"
      component={RouterLink}
      href={`${paths.admin.invoice}?fStatus=-1`}
    >
      <Card sx={sx}>
        <CardContent>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                บิลที่ถูกยกเลิก
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-secondary-main)', height: '56px', width: '56px' }}>
              <CancelTwoTone />
            </Avatar>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}