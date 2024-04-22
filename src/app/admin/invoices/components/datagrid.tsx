"use client"
import Datatable from '@/components/datatable'
import { CancelTwoTone, EditTwoTone, PeopleTwoTone, PrintTwoTone, ViewAgenda } from '@mui/icons-material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { Customers, Invoice } from '@prisma/client';
import * as formatter from '@/libs/formatter';
import React from 'react'
import { InvoiceItem, getInvoicesAll, setInvoiceCancel } from '@/services/invoice';
import { condition } from '@/libs/utils';
import { paths } from '@/paths';
import { Tooltip } from '@mui/material';
import dayjs from '@/libs/dayjs';
import { useRouter } from 'next/navigation';
import GridLinkAction from '@/components/GridLinkAction';
import ViewDialog from './view';
import EditDialog from './edit';
import { useDialog } from '@/hooks/use-dialog';
import { InvoiceView } from '../../customers/[id]/components/type';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';

const columns = (actions: {
  edit: (row: InvoiceView) => any,
  cancel: (row: Invoice) => any
}): GridColDef[] => {
  return [
    { field: 'status', filterable: true, headerName: 'สถานะ', flex: 1, valueGetter: (_, row: Invoice) => formatter.invoice_(row) },
    { field: 'note', filterable: true, headerName: 'หมายเหต', flex: 1, valueGetter: (value: string) => formatter.text(value)},
    { field: 'items', filterable: false, headerName: 'จำนวน', flex: 1, valueGetter: (payload: string) => formatter.money((JSON.parse(payload) as InvoiceItem[]).reduce((p, i) => p + (i.amount * i.price), 0)) },
    { field: 'start', filterable: false, headerName: 'วันที่เริ่ม', flex: 1, valueGetter: (date: Date) => formatter.date2(date) },
    { field: 'end', filterable: false, headerName: 'วันครบกำหนด', flex: 1, valueGetter: (date: Date) => formatter.date2(date) },
    { field: 'owner', filterable: false, headerName: 'ลูกค้า', flex: 1, valueGetter: ({ firstname, lastname }: Customers) => `${firstname} ${lastname}` },
    { field: 'createdBy', filterable: false, headerName: 'เพิ่มโดย', flex: 1, valueGetter: (_, { createdBy }: { createdBy: { firstname: string, lastname: string } }) => `${createdBy.firstname} ${createdBy.lastname}` },
    { field: 'createdAt', filterable: false, headerName: 'วันที่เพิ่ม', flex: 1, valueGetter: (value: Date) => dayjs(value).fromNow() },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'เครื่องมือ',
      flex: 1,
      getActions: ({ row }: { row: Invoice }) => [
        <GridLinkAction key="print" to={`${paths.admin.invoice}/${row.id}`} icon={<PrintTwoTone />} label="พิมพ์" showInMenu />,
        <GridLinkAction key="print" to={`${paths.admin.customers}/${row.ownerId}`} icon={<PeopleTwoTone />} label="ดูลูกค้า" showInMenu />,
        ...(row.status == 0 ? (
          [
            <GridActionsCellItem key="edit" icon={<EditTwoTone />} label="แก้ไข" onClick={(actions.edit(row as InvoiceView))} showInMenu />,
            <GridActionsCellItem key="delete" icon={<CancelTwoTone />} label="ยกเลิกบิล" onClick={(actions.cancel(row))} showInMenu />,
          ]
        ) : [])
      ],
    }
  ]
}

const Datagrid = () => {
  const router = useRouter();
  const viewDialog = useDialog<HTMLElement>();
  const editDialog = useDialog<HTMLElement>();
  const [invoice, setInvoice] = React.useState<InvoiceView | null>(null);
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();


  const onView = ({ row }: { row: InvoiceView }) => {
    setInvoice(row); viewDialog.handleOpen();
  }

  const cancelConfirm = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "คุณต้องการที่จะยกเลิกบิลนี้หรือไม่?",
    onConfirm: async (id: number) => {
      setBackdrop(true);

      try {
        const resp = await setInvoiceCancel(Number(id));

        if (resp && resp.state) {
          enqueueSnackbar("ยกเลิกบิลแล้ว!", { variant: 'success' });
          await queryClient.refetchQueries({ queryKey: ['invoicesall'], type: 'active' })
        } else {
          enqueueSnackbar("ยกเลิกบิลไม่สำเร็จ กรุณาลองอีกครั้งภายหลัง", { variant: "error" });
        }
      } catch (error) {
        enqueueSnackbar("มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่ภายหลัง", { variant: "error" });
      } finally {
        setBackdrop(false);
      }
    }
  })

  const actions = {
    edit: React.useCallback((data: InvoiceView) => () => { setInvoice(data); editDialog.handleOpen(); }, [setInvoice, editDialog]),
    cancel: React.useCallback((data: Invoice) => () => { cancelConfirm.with(data.id); cancelConfirm.handleOpen(); }, [cancelConfirm])
  }

  return (
    <>
      <Datatable
        columns={columns(actions)}
        name={'invoicesall'}
        fetch={getInvoicesAll}
        height={700}
        getCellClassName={(params) => params.field == 'status' ? `text-color-${condition(formatter.invoice(params.row), { [-1]: "secondary", 0: "info", 1: "success", 2: "primary", 3: "warning", 4: "error" }, 'normal') as string}` : ""}
        onDoubleClick={onView}
      />

      <ViewDialog onClose={viewDialog.handleClose} onOpen={viewDialog.handleOpen} open={viewDialog.open} invoice={invoice} />
      <EditDialog onClose={editDialog.handleClose} onOpen={editDialog.handleOpen} open={editDialog.open} invoice={invoice} />
      <Confirmation {...cancelConfirm.props} />
    </>

  )
}

export default Datagrid