"use server";
import Prisma from "@/libs/prisma";
import { TableFetch } from "./type";
import * as formatter from '@/libs/formatter';
import dayjs, { Dayjs } from '@/libs/dayjs';
import { v4 } from 'uuid';
import { getServerSession } from "@/libs/session";
import { z } from "zod";
import { extname, join } from "path";
import { Activity } from "@/libs/activity";
import sharp from "sharp";
import { push } from "@/libs/line";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export interface InvoiceItem {
  title: string,
  amount: number,
  price: number
}

export const getInvoices = async (table: TableFetch, id: number) => {
  try {
    const data = await Prisma.$transaction([
      Prisma.invoice.findMany({
        where: {
          ownerId: id,
          ...formatter.filter(table.filter, ['note'])
        },
        take: table.pagination.pageSize,
        skip: table.pagination.page * table.pagination.pageSize,
        orderBy: formatter.order(table.sort),
        select: {
          id: true,
          status: true,
          note: true,
          items: true,
          start: true,
          end: true,
          createdAt: true,
          image: true,
          ownerId: true,
          createdBy: {
            select: {
              firstname: true,
              lastname: true
            }
          },
        }
      }),
      Prisma.invoice.count({ where: { ownerId: id } }),
    ])

    return {
      state: true,
      data: data[0],
      total: data[1]
    }
  } catch (error) {
    return {
      state: false,
      data: [],
      total: 0
    }
  }
}

export const getInvoice = async (id: number) => {
  try {
    const invoice = await Prisma.invoice.findFirst({
      where: { id: id },
      select: {
        id: true,
        items: true,
        owner: {
          select: {
            firstname: true,
            lastname: true,
          }
        }
      }
    })

    return { state: true, invoice }
  } catch (error) {

    return { state: false }
  }
}

export const getInvoicesAll = async (table: TableFetch) => {
  try {
    const filter = formatter.filter(table.filter, ['code', 'note'], (text) => [
      { createdBy: { ...formatter.filter(table.filter, ['firstname', 'lastname']) }, },
      { owner: { ...formatter.filter(table.filter, ['firstname', 'lastname']) }, }
    ])

    const data = await Prisma.$transaction([
      Prisma.invoice.findMany({
        take: table.pagination.pageSize,
        skip: table.pagination.page * table.pagination.pageSize,
        orderBy: formatter.order(table.sort),
        where: {
          ...filter,
          ...(
            table.filter.items.find((i: any) => i.field == "status") ? ({}) : (
              {
                NOT: {
                  status: -1
                }
              }
            )
          )
        },
        select: {
          id: true,
          status: true,
          note: true,
          items: true,
          start: true,
          end: true,
          createdAt: true,
          ownerId: true,
          image: true,
          createdBy: {
            select: {
              firstname: true,
              lastname: true
            }
          },
          owner: {
            select: {
              firstname: true,
              lastname: true
            }
          }
        }
      }),
      Prisma.invoice.count(),
    ])

    return {
      state: true,
      data: data[0],
      total: data[1]
    }
  } catch (error) {
    return {
      state: false,
      data: [],
      total: 0
    }
  }
}

export const getNoticeInvoice = async (id: number) => {
  const currentTime = dayjs();

  try {
    const data = await Prisma.$transaction([
      Prisma.invoice.findMany({
        where: {
          ownerId: id,
          start: {
            lte: currentTime.toDate(), // Less than or equal to current time
          },
          OR: [
            { status: 0 },
            { status: 2 }
          ]
        },
        select: {
          id: true,
          items: true,
          start: true,
          end: true,
          status: true
        }
      }),
      Prisma.payment.findFirst({
        where: {
          active: true,
          isDeleted: false
        },
        select: {
          title: true,
          name: true,
          account: true
        }
      })
    ])

    return {
      state: true,
      data: data[0],
      account: data[1]
    }
  } catch (error) {
    return {
      state: false,
      data: []
    }
  }
}

export const getInvoicesAnalysis = async (id: number) => {
  try {
    const data = await Prisma.invoice.findMany({
      where: {
        ownerId: id
      },
      select: {
        status: true,
        start: true,
        end: true
      }
    })

    return {
      state: true,
      data: data
    }
  } catch (error) {
    return {
      state: false,
      data: []
    }
  }
}

export const upsertInvoice = async (payload: {
  id?: number,
  items: InvoiceItem[],
  note: string,
  start: Dayjs,
  end: Dayjs,
  owner: number
}) => {
  try {
    const session = await getServerSession();
    const data = {
      code: v4(),
      note: payload.note,
      items: JSON.stringify(payload.items),
      start: dayjs(payload.start).startOf("day").toDate(),
      end: dayjs(payload.end).endOf("day").toDate(),
      createdById: session?.user.uid as number,
      ownerId: payload.owner,
      status: 0
    }

    const invoice = await Prisma.invoice.upsert({
      where: {
        id: payload.id || 0,
      },
      create: data,
      update: {
        note: data.note,
        start: data.start,
        end: data.end,
        items: data.items
      },
      include: {
        owner: { select: { id: true, firstname: true, lastname: true } }
      }
    })

    if (!payload.id) {
      Activity({
        category: "invoice",
        type: "CREATE",
        data: {
          id: invoice.owner.id,
          firstname: invoice.owner.firstname,
          lastname: invoice.owner.lastname,
          invoiceId: invoice.id
        }
      })
    } else {
      Activity({
        category: "invoice",
        type: "UPDATE",
        data: {
          id: invoice.owner.id,
          firstname: invoice.owner.firstname,
          lastname: invoice.owner.lastname,
          invoiceId: invoice.id
        }
      })
    }

    return {
      state: true
    }
  } catch (error) {
    return {
      state: false
    }
  }
}

export const setInvoiceCancel = async (id: number) => {
  try {
    const invoice = await Prisma.invoice.update({
      where: { id: id },
      data: { status: -1 },
      include: { owner: { select: { id: true, firstname: true, lastname: true } } }
    })

    Activity({
      category: "invoice",
      type: "CANCEL",
      data: {
        id: invoice.owner.id,
        firstname: invoice.owner.firstname,
        lastname: invoice.owner.lastname,
        invoiceId: invoice.id
      }
    })

    return { state: true }
  } catch (error) {
    return { state: false }
  }
}

const imageSchema = z.object({
  image: z
    .any()
    .refine((file) => {
      if (file.size === 0 || file.name === undefined) return false;
      else return true;
    }, "Please update or add new image.")

    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    )
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`),
});

export const setInvoicePayment = async (id: number, formData: FormData) => {
  try {
    const data = Object.fromEntries(formData);
    const validate = imageSchema.safeParse({
      image: data.image,
    });

    if (!validate.success) return { state: false }
    const image = data.image as File;
    const fileName = id + v4() + extname(image.name).toUpperCase();
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, fileName);
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes)

    await sharp(buffer)
    .jpeg({ quality: 5 })
    .png({ compressionLevel: 9 })
    .toFile(filePath)

    const invoice = await Prisma.invoice.update({
      where: { id: id },
      data: {
        image: fileName,
        status: 2
      },
      include: {
        owner: { select: { firstname: true, lastname: true } }
      }
    })

    push(`บิล #${formatter.number(invoice.id)} ของ ${invoice.owner.firstname} ${invoice.owner.lastname} ถูกแจ้งชำระแล้วแล้ว!`)

  } catch (error) {
    return { state: false }
  }
}

export const setInvoicePaymentStatus = async (id: number, status: 0 | 1) => {
  try {
    const invoice = await Prisma.invoice.update({
      where: { id: id },
      data: {
        status: status
      },
      include: {
        owner: { select: { id: true, firstname: true, lastname: true, lineToken: true } }
      }
    })

    if (status == 1) {
      //success
      Activity({
        category: "invoice",
        type: "SUCCESS",
        data: {
          id: invoice.id,
          firstname: invoice.owner.firstname,
          lastname: invoice.owner.lastname,
          invoiceId: invoice.owner.id
        }
      })

      if (invoice.owner.lineToken) push(`ใบแจ้งหนี้หมายเลข #${formatter.number(invoice.id)} ถูกอนุมัติแล้ว.`, invoice.owner.lineToken)
    } else {
      //deny
      Activity({
        category: "invoice",
        type: "DENY",
        data: {
          id: invoice.id,
          firstname: invoice.owner.firstname,
          lastname: invoice.owner.lastname,
          invoiceId: invoice.owner.id
        }
      })

      if (invoice.owner.lineToken) push(`ใบแจ้งหนี้หมายเลข #${formatter.number(invoice.id)} ถูกปฏิเสธแล้ว.`, invoice.owner.lineToken)
    }


    return { state: true }
  } catch (error) {
    return { state: false }
  }
}