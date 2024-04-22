"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRightTwoTone, MenuTwoTone } from '@mui/icons-material';
import * as formatter from '@/libs/formatter';
import { IconButton } from '@mui/material';
import { useMenu } from '@/hooks/use-menu';
import { InvoiceMenu } from './invoice-menu';
import { Invoice } from '@prisma/client';
import RouterLink from 'next/link';
import { paths } from '@/paths';

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
  const invoiceMenu = useMenu<HTMLButtonElement>()
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);

  const onMenuClick = (invoice: Invoice, e: React.MouseEvent<HTMLButtonElement>) => {
    setInvoice(invoice)
    invoiceMenu.handleOpen(e)
  }

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
                <TableCell>เครื่องมือ</TableCell>
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
                    <TableCell>
                      <IconButton edge="end" onClick={(e) => onMenuClick(invoice as any, e)} >
                        <MenuTwoTone />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            color="inherit"
            endIcon={<ArrowRightTwoTone />}
            size="small"
            variant="text"
            component={RouterLink}
            href={`${paths.admin.invoice}?fStatus=2`}
          >
            ดูทั้งหมด
          </Button>
        </CardActions>
      </Card>

      <InvoiceMenu onClose={invoiceMenu.handleClose} open={invoiceMenu.open} anchorEl={invoiceMenu.anchorEl} invoice={invoice} />
    </>
  );
}