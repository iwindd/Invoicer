"use server";
import Prisma from "@/libs/prisma";
import { getServerSession } from "@/libs/session";
import dayjs, { Dayjs } from '@/libs/dayjs';
import { v1 } from "uuid";
import bcrypt from 'bcrypt';

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