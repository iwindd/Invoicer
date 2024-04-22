import * as React from 'react';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps, styled, Menu as Menu_, alpha, } from '@mui/material';
import { PeopleTwoTone, ReceiptTwoTone } from '@mui/icons-material';
import { Invoice } from '@prisma/client';
import { paths } from '@/paths';
import RouterLink from 'next/link';

export interface InvoiceMenuProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
  invoice: Invoice | null;
}

const Menu = styled((props: MenuProps) => (
  <Menu_
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

export function InvoiceMenu({ anchorEl, onClose, open, invoice }: InvoiceMenuProps): React.JSX.Element {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
    >
      <MenuItem component={RouterLink} href={`${paths.admin.customers}/${invoice?.ownerId}`} onClick={onClose}><PeopleTwoTone />แสดงลูกค้า</MenuItem>
      <MenuItem component={RouterLink} href={`${paths.admin.customers}/${invoice?.ownerId}/invoice/${invoice?.id}`} onClick={onClose}><ReceiptTwoTone />แสดงบิล</MenuItem>
    </Menu>
  );
}