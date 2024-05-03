import { paths } from '@/paths';
import { CheckTwoTone } from '@mui/icons-material';
import { Avatar, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import * as React from 'react';
import RouterLink from 'next/link';

export interface TotalSuccessInvoiceProps {
  sx?: SxProps;
  value: string;
  id: number
}

export function TotalSuccessInvoice({ value, sx, id }: TotalSuccessInvoiceProps): React.JSX.Element {
  return (
    <Link
      underline="none"
      component={RouterLink}
      href={`${paths.admin.customers}/${id}?fStatus=1`}
    >
      <Card sx={sx}>
        <CardContent>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                บิลที่สำเร็จ
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <CheckTwoTone />
            </Avatar>
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
}