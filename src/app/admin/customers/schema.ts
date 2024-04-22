import { z } from 'zod';

export type Inputs = z.infer<typeof Schema>

export const Schema = z.object({
  firstname: z.string().min(6).max(100),
  lastname: z.string().min(6).max(100),
  email: z.string().min(1).email(),
})
