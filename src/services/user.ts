"use server";
import Prisma from "@/libs/prisma";
import { TableFetch } from "./type";
import * as formatter from '@/libs/formatter';
import { revalidatePath } from "next/cache";
import { paths } from "@/paths";
import { Inputs } from "@/app/admin/admin/schema";

export const getUsers = async (table: TableFetch) => {
  try {
    const data = await Prisma.$transaction([
      Prisma.user.findMany({
        where: {
          isDeleted: false,
          ...(formatter.filter(table.filter, ['firstname', 'lastname']))
        },
        take: table.pagination.pageSize,
        skip: table.pagination.page * table.pagination.pageSize,
        orderBy: formatter.order(table.sort),
        select: {
          id: true,
          createdAt: true,
          firstname: true,
          lastname: true,
          email: true,
          Customers: { select: { id: true } },
          Invoice: { select: { id: true } },
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

export const upsertAdmin = async (payload: Inputs, id?: number) => {
  try {
    const data = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      password: payload?.password || "",
      email: payload.email
    }

    const admin = await Prisma.user.upsert({
      where: {
        id: id || 0,
      },
      create: data,
      update: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
      },
    })

    revalidatePath(`${paths.admin.admin}/${admin.id}`)
    return { state: true }
  } catch (error) {
    return { state: false }
  }
}

export const deleteAdmin = async (id: number) => {
  try {
    const admin = await Prisma.user.update({
      where: { id: id },
      data: { isDeleted: true }
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

export const getAdmin = async (id: number) => {
  try {
    const data = await Prisma.user.findFirst({
      where: { id: id },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        id: true,

        Customers: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            createdAt: true
          }
        },
        Invoice: {
          select: {
            id: true,
            status: true,
            start: true,
            end: true,
            note: true,
            createdAt: true
          }
        }
      }
    })

    return {
      state: true,
      data: data
    }
  } catch (error) {
    return {
      state: false,
      data: null
    }
  }
}

export const setAdminPassword = async (password: string, id: number) => {
  try {
    await Prisma.user.update({
      where: { id: id },
      data: { password: password }
    })

    return { state: true }
  } catch (error) {
    return { state: false }
  }
}