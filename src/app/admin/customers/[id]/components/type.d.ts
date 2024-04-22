import { Invoice } from "@prisma/client";

export interface InvoiceView extends Invoice {
  createdBy: { firstname: string, lastname: string }
}
