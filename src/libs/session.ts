import { authOptions } from '@/authOptions';
import { Session, getServerSession as getServerSessionInstance } from 'next-auth';

export const getServerSession = async (): Promise<Session | null> => {
  return await getServerSessionInstance(authOptions)
}