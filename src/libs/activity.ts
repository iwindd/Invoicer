"use server";
import { ParseActivity } from "./utils";
import { push } from "./line";
import Prisma from "./prisma";
import { ActivityPayload } from './activity.d';
import { getServerSession } from "./session";

export const Activity = async (
  payload: ActivityPayload
) => {
  try {
    const session = await getServerSession();
    if (!session?.user.uid) return

    push(await ParseActivity({
      ...payload, 
      data: {
        ...payload.data,
        ...{
          sfirstname: session.user.firstname,
          slastname: session.user.lastname
        }
      } as any
    }))

    return await Prisma.activity.create({
      data: {
        source: session.user.uid as number,
        category: payload.category,
        type: payload.type,
        payload: JSON.stringify(payload),
      }
    })
  } catch (error) {
    console.warn("ACTIVITY ERROR :", error);
  }
}

