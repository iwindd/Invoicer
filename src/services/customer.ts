"use server";
import Prisma from "@/libs/prisma";
import { TableFetch } from "./type";
import * as formatter from '@/libs/formatter';
import { Inputs } from "@/app/admin/customers/schema";
import { getServerSession } from "@/libs/session";
import dayjs from '@/libs/dayjs';
import { revalidatePath } from "next/cache";
import { paths } from "@/paths";
import { push } from "@/libs/line";
import { Activity } from "@/libs/activity";

export const getCustomers = async (table: TableFetch) => {
  try {
    const filter = formatter.filter(table.filter, ['firstname', 'lastname', 'email'], (text) => [
      { createdBy: { ...formatter.filter(table.filter, ['firstname', 'lastname']) }, },
    ])

    const currentTime = dayjs();
    const data = await Prisma.$transaction([
      Prisma.customers.findMany({
        where: {
          isDeleted: false,
          ...(filter)
        },

        take: table.pagination.pageSize,
        skip: table.pagination.page * table.pagination.pageSize,
        orderBy: formatter.order(table.sort),
        select: {
          firstname: true,
          lastname: true,
          id: true,
          email: true,
          createdAt: true,
          
          createdBy: {
            select: {
              firstname: true,
              lastname: true
            }
          },
          Invoice: {
            where: {
              status: 0,
              start: { lte: currentTime.toDate() },
              end: { gte: currentTime.toDate() },
            },
            select: {
              id: true
            }
          }
        }
      }),
      Prisma.customers.count(),
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

export const getCustomer = async (id: number) => {
  try {
    const data = await Prisma.customers.findFirst({
      where: { id: id },
      select:{ 
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        lineToken: true
      }
    })

    return {
      state: true,
      data: data
    }
  } catch (error) {
    return {
      state: false,
      data: {}
    }
  }
}

export const upsertCustomer = async (payload: Inputs, id?: number) => {
  try {
    const session = await getServerSession();
    const data = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      createdById: session?.user.uid as number
    }

    const customer = await Prisma.customers.upsert({
      where: {
        id: id || 0,
      },
      create: data,
      update: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email
      },
    })

    if (!id) {
      Activity({
        category: "customer",
        type: "CREATE",
        data: {
          id: customer.id,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email
        }
      })
    } else {
      Activity({
        category: "customer",
        type: "UPDATE",
        data: { id: customer.id, firstname: customer.firstname, lastname: data.lastname, data: customer }
      })
    }


    revalidatePath(`${paths.admin.customers}/${customer.id}`)
    return { state: true }
  } catch (error) {
    console.log(error);
    
    return { state: false }
  }
}

export const deleteCustomer = async (id: number) => {
  try {
    await Prisma.customers.update({
      where: { id: id },
      data: { isDeleted: true }
    })

    Activity({
      category: "customer",
      type: "DELETE",
      data: { id }
    })

    return {
      state: true
    }
  } catch (error) {
    return {
      state: false
    }
  }
}

export const lineConnect = async (id: number, lineToken: string) => {
  try {
    const pushResp = await push("Invoicer connected.", lineToken);
    if (pushResp) {
      const data = await Prisma.customers.update({
        data: { lineToken },
        where: { id }
      })

      Activity({
        category: "customer",
        type: "LINE_CONNECT",
        data: { id: id, firstname: data.firstname, lastname: data.lastname }
      })
    }

    return { state: true }
  } catch (error) {
    return { state: false }
  }
}