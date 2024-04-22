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
import dayjs from '@/libs/dayjs';
import { ArrowRightTwoTone, PeopleTwoTone, SearchTwoTone } from '@mui/icons-material';
import { ListItemIcon, Tooltip } from '@mui/material';
import * as formatter from '@/libs/formatter'
import { Customers, User } from '@prisma/client';
import RouterLink from 'next/link';
import { paths } from '@/paths';
import Link from 'next/link';


export interface TableAdminCustomersProps {
  customers?: Customers[];
  sx?: SxProps;
  data: User
}

export function TableAdminCustomers({ customers = [], sx, data }: TableAdminCustomersProps): React.JSX.Element {
  const filters = customers.slice(0, 5);

  return (
    <>
      <Card sx={sx}>
        <CardHeader title="ลูกค้า" />
        <Divider />
        <List>
          {filters.map((customer, index) => (
            <ListItem divider={index < filters.length - 1} key={customer.id}>
              <ListItemIcon>
                <PeopleTwoTone />
              </ListItemIcon>
              <ListItemText
                primary={formatter.text(`${customer.firstname} ${customer.lastname}`)}
                primaryTypographyProps={{ variant: 'subtitle1' }}
                secondary={`สร้างเมื่อ ${dayjs(customer.createdAt).fromNow()}`}
                secondaryTypographyProps={{ variant: 'body2' }}
              />
              <Tooltip title="ดูรายละเอียด" >
                <Link href={`${paths.admin.customers}/${customer.id}`}>
                  <IconButton edge="end" >
                    <SearchTwoTone />
                  </IconButton>
                </Link>
              </Tooltip>
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
            href={`${paths.admin.customers}?search=${data.firstname} ${data.lastname}`}
          >
            ดูทั้งหมด
          </Button>
        </CardActions>
      </Card>
    </>
  );
}