
import { z } from 'zod';

export type Inputs = z.infer<typeof Schema>

export const Schema = z.object({
  email: z.string().email().min(6),
  password: z.string().min(6),
})
