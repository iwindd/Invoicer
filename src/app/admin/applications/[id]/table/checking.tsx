"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as formatter from '@/libs/formatter';
import { Invoice } from '@prisma/client';

export interface CheckingInvoiceProps {
  invoices?: {
    id: number,
    note: string,
    uploadAt: Date,
    owner: { firstname: string, lastname: string }
  }[];
  sx?: SxProps;
}

export function CheckingInvoice({ invoices = [], sx }: CheckingInvoiceProps): React.JSX.Element {
  const filters = invoices.slice(0, 7);
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);


  return (
    <>
      <Card sx={sx}>
        <CardHeader title="บิลที่ต้องตรวจสอบ" />
        <Divider />
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }} size='small'>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>ลูกค้า</TableCell>
                <TableCell>วันที่แจ้งชำระ</TableCell>
                <TableCell>สถานะ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filters.map((invoice) => {
                return (
                  <TableRow hover key={invoice.id}>
                    <TableCell>#{formatter.number(invoice.id)}</TableCell>
                    <TableCell>{formatter.text(`${invoice.owner.firstname} ${invoice.owner.lastname}`)}</TableCell>
                    <TableCell>{formatter.date2(invoice.uploadAt)}</TableCell>
                    <TableCell><Chip label={'กำลังรอตรวจสอบ'} size="small" color='primary' /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </>
  );
}