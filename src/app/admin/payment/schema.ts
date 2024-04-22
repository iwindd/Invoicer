import { z } from 'zod';

export type Inputs = z.infer<typeof Schema>

export const Schema = z.object({
  title: z.string().min(3).max(100),
  name: z.string().min(3).max(100),
  account: z.string().min(1),
})
