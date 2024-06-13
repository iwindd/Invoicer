"use server";
import { Inputs } from "@/app/manager/applications/schema";
import Prisma from "@/libs/prisma";
import { TableFetch } from "./type";
import * as formatter from '@/libs/formatter';

export const getApplications = async (table: TableFetch) => {
  try {
    const data = await Prisma.$transaction([
      Prisma.application.findMany({
        where: {
          isDeleted: false,
          ...formatter.filter(table.filter, ['title'])
        },
        take: table.pagination.pageSize,
        skip: table.pagination.page * table.pagination.pageSize,
        orderBy: formatter.order(table.sort),
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      }),
      Prisma.application.count({ where: { isDeleted: false } }),
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

export const upsertApplication = async (payload: Inputs, id?: number) => {
  try {
    const data = {
      title: payload.title,
      lineNotify: payload.token || ""
    }

    const application = await Prisma.application.upsert({
      where: {
        id: id || 0,
      },
      create: data,
      update: {
        title: data.title,
        lineNotify: data.lineNotify
      },
    })

    return { state: true }
  } catch (error) {
    return { state: false }
  }
}