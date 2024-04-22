"use client";
import Datatable from '@/components/datatable'
import React from 'react'
import * as formatter from '@/libs/formatter'
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { Payment } from '@prisma/client';
import { DeleteTwoTone, EditTwoTone, ToggleOnTwoTone } from '@mui/icons-material';
import { useQueryClient } from '@tanstack/react-query';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { useRouter } from 'next/navigation';
import { activePayment, deletePayment, getPayments } from '@/services/payment';
import { useDialog } from '@/hooks/use-dialog';
import EditDialog from './edit';

const columns = (menu: {
  onEdit: (data: Payment) => any;
  onDelete: (data: Payment) => any;
  onActive: (data: Payment) => any;
}): GridColDef[] => {
  return [
    { field: 'active', headerName: 'สถานะ', flex: 1, valueGetter: (value: boolean) => value ? "กำลังใช้งาน" : "ไม่ถูกใช้งาน" },
    { field: 'account', headerName: 'หมายเลขบัญชี', flex: 1, valueGetter: (value) => value },
    { field: 'title', headerName: 'ธนาคาร', flex: 1 },
    { field: 'name', headerName: 'ชื่อบัญชี', flex: 1, valueGetter: (value) => formatter.text(value) },
    { field: 'createdAt', headerName: 'วันที่เพิ่ม', flex: 1, valueGetter: (value: Date) => formatter.date(value) },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'เครื่องมือ',
      flex: 1,
      getActions: ({ row }: { row: Payment }) => [
        <GridActionsCellItem key="view" icon={<EditTwoTone />} label="แก้ไข" onClick={(menu.onEdit(row))} showInMenu />,
        ...(
          !row.active ? (
            [
              <GridActionsCellItem key="delete" icon={<DeleteTwoTone />} label="ลบ" onClick={(menu.onDelete(row))} showInMenu />,
              <GridActionsCellItem key="active" icon={<ToggleOnTwoTone />} label="เปิดใช้งาน" onClick={(menu.onActive(row))} showInMenu />
            ]
          ) : []
        )
      ],
    }
  ]
}

const Datagrid = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const editDialog = useDialog<HTMLDivElement>();
  const [payment, setPayment] = React.useState<Payment | null>(null);

  const confirmation = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "",
    onConfirm: async (id: number) => {
      setBackdrop(true);
      try {
        setBackdrop(true);
        const resp = await deletePayment(id)

        if (resp.state) {
          await queryClient.refetchQueries({ queryKey: ['payments'], type: 'active' })
          enqueueSnackbar("ลบช่องทางการชะระสำเร็จแล้ว!", { variant: 'success' });
        } else {
          enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", { variant: 'error' });
      } finally {
        setBackdrop(false)
      }
    }
  })

  const Menu = {
    onEdit: React.useCallback((data: Payment) => () => {
      setPayment(data)
      editDialog.handleOpen()
    }, [editDialog, setPayment]),
    onDelete: React.useCallback((data: Payment) => () => {
      if (data.active) {
        return enqueueSnackbar("ไม่สามารถลบบัญชีที่กำลังใช้งานได้", { variant: "error" })
      }

      confirmation.with(data.id)
      confirmation.setText(`คุณต้องการที่จะลบบัญชีนี้หรือไม่?`)
      confirmation.handleOpen();
    }, [confirmation, enqueueSnackbar]),
    onActive: React.useCallback((data: Payment) => async () => {
      try {
        setBackdrop(true);
        const resp = await activePayment(data.id)

        if (resp.state) {
          await queryClient.refetchQueries({ queryKey: ['payments'], type: 'active' })
          enqueueSnackbar("เปิดใช้งานบัญชีนี้สำเร็จ!", { variant: 'success' });
        } else {
          enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar("เกิดข้อผิดพลาดกรุณาลองใหม่อีกครั้งภายหลัง!", { variant: 'error' });
      } finally {
        setBackdrop(false)
      }
    }, [setBackdrop, enqueueSnackbar, queryClient]),
  }

  return (
    <>
      <Datatable
        columns={columns(Menu)}
        name={'payments'}
        fetch={getPayments}
        height={700}
        getCellClassName={(params) => params.field == 'active' ? `text-color-${params.row.active ? "primary" : "secondary"}` : ""}
      />

      <EditDialog onClose={editDialog.handleClose} onOpen={editDialog.handleOpen} open={editDialog.open} payment={payment} />
      <Confirmation {...confirmation.props} />
    </>
  )
}

export default Datagrid