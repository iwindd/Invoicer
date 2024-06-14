"use server";

import prisma from "@/libs/prisma";
import { getServerSession } from "@/libs/session";

export const isEmailAlreadyUsed = async (email: string) => {
  try {
    const foundUser = await prisma.user.count({where: {email}});
    const foundCustoemr = await prisma.customers.count({where:{email}});

    return foundUser > 0 || foundCustoemr > 0
  } catch (error) {
    return true
  }
}

export const isRootAccount = async() => {
  try {
    const session = await getServerSession();
    
    if (!session?.user.root) return false;

    const user = await prisma.user.count({
      where: {
        id: session.user.uid,
        root: session.user.root
      }
    })

    if (user <= 0) return false;

    return true
  } catch (error) {
    return false
  }
}