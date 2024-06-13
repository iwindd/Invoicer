"use client";
import Datatable from '@/components/datatable'
import React from 'react'
import * as formatter from '@/libs/formatter'
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { Customers, Invoice, User } from '@prisma/client';
import { Delete, ViewAgenda } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { paths } from '@/paths';
import { useRouter } from 'next/navigation';
import GridLinkAction from '@/components/GridLinkAction';
import { deleteAdmin } from '@/services/user';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { getApplications } from '@/services/application';

const columns = (menu: {
  onDelete: (data: User) => any;
}, session: Session | null): GridColDef[] => {
  return [
    { field: 'joinedAt', headerName: 'วันที่เข้าร่วม', flex: 1, valueGetter: (value: Date) => formatter.date(value) },
    { field: 'firstname', headerName: 'ชื่อลูกค้า', flex: 1, valueGetter: (_, row: Customers) => formatter.text(`${row.firstname} ${row.lastname}`)},
    {
      field: 'actions',
      type: 'actions',
      headerName: 'เครื่องมือ',
      flex: 1,
      getActions: ({ row }: { row: User }) => [
        <GridLinkAction key="view" to={`${paths.admin.applications}/${row.id}`} icon={<ViewAgenda />} label="ดูรายละเอียด" showInMenu />,
        <GridActionsCellItem key="delete" icon={<Delete />} label="ลบ" onClick={(menu.onDelete(row))} showInMenu />
      ],
    }
  ]
}

const Datagrid = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const { data: session } = useSession();

  const deleteConfirmation = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "",
    onConfirm: async (id: number) => {
      setBackdrop(true);
      const resp = await deleteAdmin(id)

      if (resp.state) {
        enqueueSnackbar("ลบแอดมินสำเร็จ!", { variant: "success" });
        await queryClient.refetchQueries({ queryKey: ['admins'], type: 'active' })
      } else {
        enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง", { variant: "error" });
      }
      setBackdrop(false);
    }
  })

  const Menu = {
    onDelete: React.useCallback((data: User) => () => {
      deleteConfirmation.with(data.id)
      deleteConfirmation.setText(`คุณต้องการที่จะลบแอดมิน"${data.firstname} ${data.lastname}"หรือไม่?`)
      deleteConfirmation.handleOpen();
    }, [deleteConfirmation]),
  }

  return (
    <>
      <Datatable
        columns={columns(Menu, session)}
        name={'applications'}
        fetch={getApplications}
        height={700}
        onDoubleClick={
          ({ row: data }: { row: User }) => router.push(`${paths.admin.applications}/${data.id}`)
        }
      />
      <Confirmation {...deleteConfirmation.props} />
    </>
  )
}

export default Datagrid