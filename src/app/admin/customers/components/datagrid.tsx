"use client";
import Datatable from '@/components/datatable'
import React from 'react'
import * as formatter from '@/libs/formatter'
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { Customers, Invoice } from '@prisma/client';
import { Delete, ViewAgenda } from '@mui/icons-material';
import { deleteCustomer, getCustomers } from '@/services/customer';
import { useQueryClient } from '@tanstack/react-query';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { paths } from '@/paths';
import { notFound, useRouter } from 'next/navigation';
import GridLinkAction from '@/components/GridLinkAction';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

const columns = (menu: {
  onDelete: (data: Customers) => any;
}, session: Session): GridColDef[] => {

  return [
    { field: 'joinedAt', headerName: 'วันที่เข้าร่วม', flex: 1, valueGetter: (value: Date) => formatter.date(value) },
    ...(
      session.user.root ? (
        [{ field: 'isApplication', headerName: 'แอพพลิเคชั่น', flex: 1, valueGetter: (value: boolean) => !value ? "ไม่":"ใช่" }]
      ): ([])
    ),
    { field: 'firstname', headerName: 'ชื่อ', flex: 1, valueGetter: (_, row: Customers) => formatter.text(`${row.firstname} ${row.lastname}`)},
    { field: 'email', headerName: 'อีเมล', flex: 1 },
    { field: 'Invoice', headerName: 'กำลังดำเนินการ', flex: 1, valueGetter: (value: Invoice[]) => formatter.number(value.length) },
    { field: 'createdBy', headerName: 'เพิ่มโดย', flex: 1, valueGetter: (_, { createdBy }: { createdBy: { firstname: string, lastname: string } }) => `${createdBy.firstname} ${createdBy.lastname}` },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'เครื่องมือ',
      flex: 1,
      getActions: ({ row }: { row: Customers }) => [
        <GridLinkAction key="view" to={`${paths.admin.customers}/${row.id}`} icon={<ViewAgenda />} label="ดูรายละเอียด" showInMenu />,
        <GridActionsCellItem key="delete" icon={<Delete />} label="ลบ" onClick={(menu.onDelete(row))} showInMenu />,
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

  if (!session) return notFound()

  const deleteConfirmation = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "",
    onConfirm: async (id: number) => {
      setBackdrop(true);
      const resp = await deleteCustomer(id)
  
      if (resp.state) {
        enqueueSnackbar("ลบลูกค้าสำเร็จ!", { variant: "success" });
        await queryClient.refetchQueries({ queryKey: ['customers'], type: 'active' })
      } else {
        enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง", { variant: "error" });
      }
      setBackdrop(false);
    }
  })

  const Menu = {
    onDelete: React.useCallback((data: Customers) => () => {
      deleteConfirmation.with(data.id)
      deleteConfirmation.setText(`คุณต้องการที่จะลบลูกค้า"${data.firstname} ${data.lastname}"หรือไม่?`)
      deleteConfirmation.handleOpen();
    }, [deleteConfirmation]),
  }

  return (
    <>
      <Datatable
        columns={columns(Menu, session)}
        name={'customers'}
        fetch={getCustomers}
        height={700}
        onDoubleClick={
          ({ row: data }: { row: Customers }) => router.push(`${paths.admin.customers}/${data.id}`)
        }
      />
      <Confirmation {...deleteConfirmation.props}  />
    </>
  )
}

export default Datagrid