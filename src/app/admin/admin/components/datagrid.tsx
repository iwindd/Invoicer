"use client";
import Datatable from '@/components/datatable'
import React from 'react'
import * as formatter from '@/libs/formatter'
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { Customers, Invoice } from '@prisma/client';
import { Delete, ViewAgenda } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { paths } from '@/paths';
import { useRouter } from 'next/navigation';
import GridLinkAction from '@/components/GridLinkAction';
import { deleteAdmin, getUsers} from '@/services/user';

const columns = (menu: {
  onDelete: (data: Customers) => any;
}): GridColDef[] => {
  return [
    { field: 'createdAt', headerName: 'วันที่เพิ่ม', flex: 1, valueGetter: (value: Date) => formatter.date(value) },
    { field: 'firstname', headerName: 'ชื่อ', flex: 1, valueGetter: (_, row: Customers) => formatter.text(`${row.firstname} ${row.lastname}`)},
    { field: 'email', headerName: 'อีเมล', flex: 1 },
    { field: 'Customers', headerName: 'ลูกค้าที่สร้าง', flex: 1, valueGetter: (value: Customers[]) => formatter.number(value.length) },
    { field: 'Invoice', headerName: 'บิลที่ออกทั้งหมด', flex: 1, valueGetter: (value: Invoice[]) => formatter.number(value.length) },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'เครื่องมือ',
      flex: 1,
      getActions: ({ row }: { row: Customers }) => [
        <GridLinkAction key="view" to={`${paths.admin.admin}/${row.id}`} icon={<ViewAgenda />} label="ดูรายละเอียด" showInMenu />,
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
    onDelete: React.useCallback((data: Customers) => () => {
      deleteConfirmation.with(data.id)
      deleteConfirmation.setText(`คุณต้องการที่จะลบแอดมิน"${data.firstname} ${data.lastname}"หรือไม่?`)
      deleteConfirmation.handleOpen();
    }, [deleteConfirmation]),
  }

  return (
    <>
      <Datatable
        columns={columns(Menu)}
        name={'admins'}
        fetch={getUsers}
        height={700}
        onDoubleClick={
          ({ row: data }: { row: Customers }) => router.push(`${paths.admin.admin}/${data.id}`)
        }
      />
      <Confirmation {...deleteConfirmation.props}  />
    </>
  )
}

export default Datagrid