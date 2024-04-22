import { Interface } from "readline/promises"

export type ActivityPayload = CustomerCreate | CustomerDelete | CustomerUpdate | CustomerLine |
  InvoiceCreate | InvoiceUpdate | InvoiceAllow | InvoiceDeny | InvoiceCancel | InvoiceRequest | InvoiceSuccess | InvoiceDeny

interface CustomerCreate { category: "customer", type: "CREATE", data: { id: number, firstname: string, lastname: string, email: string } }
interface CustomerDelete { category: "customer", type: "DELETE", data: { id: number } }
interface CustomerUpdate { category: "customer", type: "UPDATE", data: { id: number, firstname: string, lastname: string, data: any } }
interface CustomerLine { category: "customer", type: "LINE_CONNECT", data: { id: number, firstname: string, lastname: string } }

interface InvoiceCreate { category: "invoice", type: "CREATE", data: { id: number, firstname: string, lastname: string, invoiceId: number } }
interface InvoiceUpdate { category: "invoice", type: "UPDATE", data: { id: number, firstname: string, lastname: string, invoiceId: number } }
interface InvoiceCancel { category: "invoice", type: "CANCEL", data: { id: number, firstname: string, lastname: string, invoiceId: number } }
interface InvoiceDeny { category: "invoice", type: "DENY", data: { id: number, firstname: string, lastname: string, invoiceId: number } }
interface InvoiceSuccess { category: "invoice", type: "SUCCESS", data: { id: number, firstname: string, lastname: string, invoiceId: number } }