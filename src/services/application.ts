"use server";
import Prisma from "@/libs/prisma";
import { getServerSession } from "@/libs/session";
import dayjs from '@/libs/dayjs';
import { v1 } from "uuid";
import bcrypt from 'bcrypt';
import { TableFetch } from "./type";
import * as formatter from '@/libs/formatter';

export const createApplication = async (id: number) => {
  try {
    const customer = await Prisma.customers.findUnique({where: {id: id}});
    if (!customer) throw Error("not_found_customer");
    const password = v1().slice(0, 10);
    const user = await Prisma.user.create({
      data: {
        firstname: customer.firstname,
        lastname: customer.lastname,
        password: await bcrypt.hash(password, 16),
        email: customer.email,
        permission: 1,
        application: 0,
      }
    });

    
    await Prisma.$transaction([
      Prisma.user.update({
        where: {
          id: user.id
        },
        data:{ 
          application: user.id
        }
      }),
      Prisma.customers.update({
        where: {
          id: id
        },
        data:{ 
          isApplication: true
        }
      }) 
    ])

    return {
      state: true,
      password: password
    }
  } catch (error) {
    console.log(error);
    
    return{ 
      state: false,
      password: ""
    }
  }
}

export const getApplications = async (table: TableFetch) => {
  try {
    const filter = formatter.filter(table.filter, ['firstname', 'lastname', 'email'], (text) => [
      { createdBy: { ...formatter.filter(table.filter, ['firstname', 'lastname']) }, },
    ])
  
    const currentTime = dayjs();
    const session = await getServerSession();
    const data = await Prisma.$transaction([
      Prisma.customers.findMany({
        where: {
          isDeleted: false,
          application: session?.user.application as number,
          isApplication: true,
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
          joinedAt: true,
          isApplication: true,
  
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
      Prisma.customers.count({ where: { isDeleted: false, isApplication: true, application: session?.user.application as number } }),
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