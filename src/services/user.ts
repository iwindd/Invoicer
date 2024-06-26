"use server";
import Prisma from "@/libs/prisma";
import { TableFetch } from "./type";
import * as formatter from '@/libs/formatter';
import { revalidatePath } from "next/cache";
import { paths } from "@/paths";
import { Inputs } from "@/app/admin/admin/schema";
import bcrypt from 'bcrypt';
import { getServerSession } from "@/libs/session";
import { isEmailAlreadyUsed } from "./utils";

export const getUsers = async (table: TableFetch) => {
  try {
    const session = await getServerSession();
    const data = await Prisma.$transaction([
      Prisma.user.findMany({
        where: {
          isDeleted: false,
          ...(formatter.filter(table.filter, ['firstname', 'lastname'])), 
          application: session?.user.application as number
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
          permission: true,
          Customers: { select: { id: true } },
          Invoice: { select: { id: true } },
        }
      }),
      Prisma.user.count({ where: { isDeleted: false, application: session?.user.application as number } }),
    ])

    return {
      state: true,
      data: data[0],
      total: data[1]
    }
  } catch (error) {
    console.log(error);

    return {
      state: false,
      data: [],
      total: 0
    }
  }
}

export const upsertAdmin = async (payload: Inputs, id?: number, superadmin?: boolean) => {
  try {
    const session = await getServerSession();

    const data = {
      firstname: payload.firstname,
      lastname: payload.lastname,
      password: await bcrypt.hash(payload?.password || "unchanged", 16),
      email: payload.email,
      permission: superadmin ? 1 : 0,
      application: session?.user.application as number,
    }

    if (id) {
      // if update permission
      const source = await Prisma.user.findFirst({ where: { id: session?.user.uid }, select: { owner: true } });
      if (!source) throw Error("no_found_source");

      if (session?.user.uid != id) {
        // anti superadmin change permission of root superadmin
        const victim = await Prisma.user.findFirst({ where: { id }, select: { owner: true } });
        if (!victim) throw Error("no_found_victim");

        if (!source?.owner) {
          if (victim.owner) throw Error("cannot_change_permission");
        }
      } else {
        // anti root superadmin remove self permission
        if (source.owner && data.permission == 0) throw Error("cannot_change_permission");
      }
    }

    if (!id && await isEmailAlreadyUsed(data.email) ){
      throw Error("already_have_email");
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
        permission: data.permission
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
    const session = await getServerSession();

    if (session?.user.uid == id) return { state: false }
    await Prisma.user.update({
      where: { id: id, owner: false, application: session?.user.application as number },
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
      where: { id: id, application: (await getServerSession())?.user.application as number },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        id: true,
        permission: true,

        Customers: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            createdAt: true
          },
          where: {
            isDeleted: false
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
    const session = await getServerSession();

    if (session?.user.uid != id) {
      // anti superadmin change password of root superadmin
      const victim = await Prisma.user.findFirst({ where: { id: id }, select: { owner: true } });

      if (victim?.owner) throw Error("cannot_change_password")
    }

    const includeNoRoot = {application: session?.user.application as number}

    await Prisma.user.update({
      where: { 
        id: id, 
        ...(
          session?.user.root ? ({}):(includeNoRoot)
        )
      },
      data: { password: await bcrypt.hash(password, 16) }
    })

    return { state: true }
  } catch (error) {
    console.log(error);
    
    return { state: false }
  }
}