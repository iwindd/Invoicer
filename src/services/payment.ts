"use server";
import { Inputs } from "@/app/admin/payment/schema";
import { TableFetch } from "./type";
import * as formatter from '@/libs/formatter';
import Prisma from "@/libs/prisma";

export const getPayments = async (table: TableFetch) => {
  try {
    const data = await Prisma.$transaction([
      Prisma.payment.findMany({
        where: {
          isDeleted: false,
          ...(formatter.filter(table.filter, ['title', 'name', 'account']))
        },

        take: table.pagination.pageSize,
        skip: table.pagination.page * table.pagination.pageSize,
        orderBy: formatter.order(table.sort),
        select: {
          id: true,
          title: true,
          name: true,
          account: true,
          active: true,
          createdAt: true
        }
      }),
      Prisma.payment.count(),
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

export const deactivePayment = async () => {
  try {
    await Prisma.payment.updateMany({
      where: { active: true },
      data: { active: false }
    })

    return { state: true }
  } catch (error) {
    return { state: false }
  }
}

export const activePayment = async (id: number) => {
  try {

    const resp = await deactivePayment()

    if (!resp.state) return resp;

    await Prisma.payment.update({ where: { id }, data: { active: true } })

    return { state: true }
  } catch (error) {
    return { state: false }
  }
}

export const upsertPayment = async (payload: Inputs, active: boolean, id?: number) => {
  try {

    const getActive = async () => {
      if (active) {
        const deactiveResp = await deactivePayment()
        if (!deactiveResp.state) return false
        return true
      }

      return active
    }

    const data = {
      title: payload.title,
      name: payload.name,
      account: payload.account,
      active: await getActive(),
    }

    await Prisma.payment.upsert({
      where: { id: id || 0, },
      create: data,
      update: data
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

export const deletePayment = async (id: number) => {
  try {
    await Prisma.payment.update({ where: { id, active: false }, data: { isDeleted: true } })

    return { state: true }
  } catch (error) {
    return { state: false }
  }
}