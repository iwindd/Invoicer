"use client";
import Datagrid from '@/components/datatable';
import { InvoiceItem, getInvoices, setInvoiceCancel, setInvoicePaymentStatus } from '@/services/invoice';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import * as formatter from '@/libs/formatter'
import React from 'react'
import { condition } from '@/libs/utils';
import { useParams } from 'next/navigation';
import { Invoice } from '@prisma/client';
import { CancelTwoTone, CreditCardTwoTone, EditTwoTone, PrintTwoTone, ViewAgenda } from '@mui/icons-material';
import { useDialog } from '@/hooks/use-dialog';
import ViewDialog from '../../../invoices/components/view';
import { Confirmation, useConfirm } from '@/hooks/use-confirm';
import { useInterface } from '@/app/providers/InterfaceProvider';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import { InvoiceView } from './type';
import EditDialog from '../../../invoices/components/edit';
import { paths } from '@/paths';
import GridLinkAction from '@/components/GridLinkAction';

const colomns = (actions: {
  edit: (row: InvoiceView) => any,
  cancel: (row: Invoice) => any
  payment: (row: Invoice) => any
  denypayment: (row: Invoice) => any
}): GridColDef[] => [
    { field: 'status', headerName: 'สถานะ', flex: 1, valueGetter: (_, row: Invoice) => formatter.invoice_(row) },
    { field: 'note', headerName: 'หมายเหตุ', flex: 1, valueGetter: (note: string) => formatter.text(note) },
    { field: 'items', headerName: 'จำนวน', flex: 1, valueGetter: (payload: string) => formatter.money((JSON.parse(payload) as InvoiceItem[]).reduce((p, i) => p + (i.amount * i.price), 0)) },
    { field: 'start', headerName: 'วันที่เริ่ม', flex: 1, valueGetter: (date: Date) => formatter.date2(date) },
    { field: 'end', headerName: 'วันครบกำหนด', flex: 1, valueGetter: (date: Date) => formatter.date2(date) },
    { field: 'createdBy', headerName: 'เพิ่มโดย', flex: 1, valueGetter: (_, { createdBy }: { createdBy: { firstname: string, lastname: string } }) => `${createdBy.firstname} ${createdBy.lastname}` },
    { field: 'createdAt', headerName: 'วันที่เพิ่ม', flex: 1, valueGetter: (date: Date) => formatter.date(date) },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'เครื่องมือ',
      flex: 1,
      getActions: ({ row }: { row: Invoice }) => [
        <GridLinkAction key="print" to={`${paths.admin.customers}/${row.ownerId}/invoice/${row.id}`} icon={<PrintTwoTone />} label="พิมพ์" showInMenu />,
        ...(row.status == 0 ? (
          [
            <GridActionsCellItem key="edit" icon={<EditTwoTone />} label="แก้ไข" onClick={(actions.edit(row as InvoiceView))} showInMenu />,
            <GridActionsCellItem key="delete" icon={<CancelTwoTone />} label="ยกเลิกบิล" onClick={(actions.cancel(row))} showInMenu />,
            <GridActionsCellItem key="payment" icon={<CreditCardTwoTone />} label="ชำระบิลแล้ว" onClick={(actions.payment(row))} showInMenu />,
          ]
        ) : row.status == 1 ? (
          [
            <GridActionsCellItem key="denypayment" icon={<CreditCardTwoTone />} label="ยกเลิกการชำระบิล" onClick={(actions.denypayment(row))} showInMenu />,

          ]
        ) : [])
      ],
    }
  ]

const Datatable = () => {
  const { id } = useParams()
  const viewDialog = useDialog<HTMLElement>();
  const editDialog = useDialog<HTMLElement>();
  const [invoice, setInvoice] = React.useState<InvoiceView | null>(null);
  const { setBackdrop } = useInterface();
  const { enqueueSnackbar } = useSnackbar()
  const queryClient = useQueryClient();
  const cancelConfirm = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "คุณต้องการที่จะยกเลิกบิลนี้หรือไม่?",
    onConfirm: async (id: string) => {
      setBackdrop(true);

      try {
        const resp = await setInvoiceCancel(Number(id));

        if (resp && resp.state) {
          enqueueSnackbar("ยกเลิกบิลแล้ว!", { variant: 'success' });
          await queryClient.refetchQueries({ queryKey: ['invoices'], type: 'active' })
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

  const paymentConfirm = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "คุณต้องการที่จากตั้งสถานะเป็นชำระแล้วหรือไม่?",
    onConfirm: async (id: string) => {
      setBackdrop(true);

      try {
        const resp = await setInvoicePaymentStatus(Number(id), 1);

        if (resp && resp.state) {
          enqueueSnackbar("เปลี่ยนสถานะสำเร็จ!", { variant: 'success' });
          await queryClient.refetchQueries({ queryKey: ['invoices'], type: 'active' })
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

  const denypaymentConfirm = useConfirm<HTMLElement>({
    title: "แจ้งเตือน",
    text: "คุณต้องการที่จากตั้งสถานะเป็นชำระแล้วหรือไม่?",
    onConfirm: async (id: string) => {
      setBackdrop(true);

      try {
        const resp = await setInvoicePaymentStatus(Number(id), 0);

        if (resp && resp.state) {
          enqueueSnackbar("เปลี่ยนสถานะสำเร็จ!", { variant: 'success' });
          await queryClient.refetchQueries({ queryKey: ['invoices'], type: 'active' })
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


  const onView = ({ row }: { row: InvoiceView }) => {
    setInvoice(row); viewDialog.handleOpen();
  }

  const actions = {
    edit: React.useCallback((data: InvoiceView) => () => { setInvoice(data); editDialog.handleOpen(); }, [setInvoice, editDialog]),
    cancel: React.useCallback((data: Invoice) => () => { cancelConfirm.with(data.id); cancelConfirm.handleOpen(); }, [cancelConfirm]),
    payment: React.useCallback((data: Invoice) => () => { paymentConfirm.with(data.id); paymentConfirm.handleOpen(); }, [paymentConfirm]),
    denypayment: React.useCallback((data: Invoice) => () => { denypaymentConfirm.with(data.id); denypaymentConfirm.handleOpen(); }, [denypaymentConfirm]),
  }

  return (
    <>
      <Datagrid
        columns={colomns(actions)}
        fetch={getInvoices}
        name={'invoices'}
        height={580}
        bridge={[Number(id)]}
        onDoubleClick={onView}
        getCellClassName={(params) => params.field == 'status' ? `text-color-${condition(formatter.invoice(params.row), { [-1]: "secondary", 0: "info", 1: "success", 2: "primary", 3: "warning", 4: "error" }, 'normal') as string}` : ""}
      />

      <ViewDialog onClose={viewDialog.handleClose} onOpen={viewDialog.handleOpen} open={viewDialog.open} invoice={invoice} />
      <EditDialog onClose={editDialog.handleClose} onOpen={editDialog.handleOpen} open={editDialog.open} invoice={invoice} />
      <Confirmation {...cancelConfirm.props} />
      <Confirmation {...paymentConfirm.props} />
      <Confirmation {...denypaymentConfirm.props} />
    </>
  )
}

export default Datatable