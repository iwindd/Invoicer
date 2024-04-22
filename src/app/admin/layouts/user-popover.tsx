import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { LogoutTwoTone, PeopleTwoTone } from '@mui/icons-material';
import { signOut, useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { paths } from '@/paths';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const router = useRouter();
  const { data } = useSession();
  const { enqueueSnackbar } = useSnackbar();
  const { setBackdrop } = useInterface();

  const onSignup = React.useCallback(async (): Promise<void> => {
    setBackdrop(true);
    try {
      await signOut({
        callbackUrl: `${paths.auth.signIn}`,
        redirect: true
      });

      router.refresh();
      enqueueSnackbar("ออกจากระบบสำเร็จ", { variant: "success" });
      setBackdrop(false);
    } catch (err) {
      enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง", { variant: "error" })
      setBackdrop(false);
    }
  }, [router, enqueueSnackbar, setBackdrop]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{data?.user.firstname} {data?.user.lastname}</Typography>
        <Typography color="text.secondary" variant="body2">
          {data?.user.email}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem onClick={onSignup}>
          <ListItemIcon>
            <LogoutTwoTone />
          </ListItemIcon>
          ออกจากระบบ
        </MenuItem>
      </MenuList>
    </Popover>
  );
}