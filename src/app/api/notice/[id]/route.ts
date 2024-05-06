
import { InvoiceItem, getNoticeInvoice } from "@/services/invoice";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const invoices = await getNoticeInvoice(Number(id));

  return NextResponse.json({
    invoice: invoices.state ? (
      invoices.data.filter(i => (i.status == 0) || (i.status == 2 && dayjs().isAfter(dayjs(i.end).endOf('day')))).length > 0
    ) : false,
    canClose: invoices.state ? (
      invoices.data.filter((i => (i.status == 0 && dayjs().isBefore(dayjs(i.end).endOf('day'))))).length > 0
    ) : false
  }, { status: 200 });
}