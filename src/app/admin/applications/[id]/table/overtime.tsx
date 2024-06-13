"use client";
import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import type { SxProps } from '@mui/material/styles';
import dayjs from '@/libs/dayjs';
import { ReceiptTwoTone } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';
import * as formatter from '@/libs/formatter'
import { Invoice } from '@prisma/client';


export interface OvertimeInvoiceProps {
  invoices?: {
    id: number,
    note: string,
    end: Date,
    owner: { firstname: string, lastname: string }
  }[];
  sx?: SxProps;
}

export function OvertimeInvoice({ invoices = [], sx }: OvertimeInvoiceProps): React.JSX.Element {
  const filters = invoices.slice(0, 5);
  const [invoice, setInvoice] = React.useState<Invoice | null>(null);

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
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  );
}