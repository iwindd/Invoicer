"use server";

import prisma from "@/libs/prisma";

export const isEmailAlreadyUsed = async (email: string) => {
  try {
    const foundUser = await prisma.user.count({where: {email}});
    const foundCustoemr = await prisma.customers.count({where:{email}});

    return foundUser > 0 || foundCustoemr > 0
  } catch (error) {
    return true
  }
}