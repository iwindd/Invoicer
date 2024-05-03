"use client";
import React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';
import dayjs, { Dayjs } from '@/libs/dayjs';
import { ArrowRightTwoTone, MenuTwoTone, ReceiptTwoTone } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';
import * as formatter from '@/libs/formatter'
import { useMenu } from '@/hooks/use-menu';
import { InvoiceMenu } from './invoice-menu';
import { Invoice } from '@prisma/client';
import RouterLink from 'next/link';
import { paths } from '@/paths';


export interface OvertimeInvoiceProps {
  invoices?: {
    id: number,
    note: string,
    end: Dayjs,
    owner: { firstname: string, lastname: string }
  }[];
  sx?: SxProps;
}

export function OvertimeInvoice({ invoices = [], sx }: OvertimeInvoiceProps): React.JSX.Element {
  const filters = invoices.slice(0, 5);
  const invoiceMenu = useMenu<HTMLButtonElement>()
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);

  const onMenuClick = (invoice: Invoice, e: React.MouseEvent<HTMLButtonElement>) => {
    setInvoice(invoice)
    invoiceMenu.handleOpen(e)
  }

  return (
    <>
      <Card sx={sx}>
        <CardHeader title="บิลที่เลยกำหนดการ" />
        <Divider />
        <List>
          {filters.map((invoice, index) => (
            <ListItem divider={index < invoices.length - 1} key={invoice.id}>
              <ListItemIcon>
                <ReceiptTwoTone />
              </ListItemIcon>
              <ListItemText
                primary={formatter.text(`${invoice.owner.firstname} ${invoice.owner.lastname}`)}
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondary={`เลยกำหนดเมื่อ ${dayjs(invoice.end).fromNow()}`}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
              <IconButton edge="end" onClick={(e) => onMenuClick(invoice as any, e)} >
                <MenuTwoTone />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            color="inherit"
            endIcon={<ArrowRightTwoTone />}
            size="small"
            variant="text"
            component={RouterLink}
            href={`${paths.admin.invoice}?fStatus=4`}
          >
            ดูทั้งหมด
          </Button>
        </CardActions>
      </Card>

      <InvoiceMenu onClose={invoiceMenu.handleClose} open={invoiceMenu.open} anchorEl={invoiceMenu.anchorEl} invoice={invoice} />
    </>
  );
}