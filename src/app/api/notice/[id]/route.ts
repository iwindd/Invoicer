
import { InvoiceItem, getNoticeInvoice } from "@/services/invoice";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const invoices = await getNoticeInvoice(Number(id));

  return NextResponse.json({
    account: invoices.account,
    invoice: invoices.state ? (invoices.data.filter(i => i.status == 0 || i.status == 2).length > 0) : false,
    invoices: invoices.data.map(invoice => {
      const items = JSON.parse(invoice.items as string) as InvoiceItem[];
      return {
        ...invoice,
        price: items.reduce((total, i) => total + (i.price * i.amount), 0),
        items: items.map((item) => {
          return {
            ...item,
            amount: Number(item.amount),
            price: Number(item.price)
          }
        }),
      }
    })
  }, { status: 200 });
}