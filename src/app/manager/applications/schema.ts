import { z } from 'zod';

export type Inputs = z.infer<typeof Schema>

export const Schema = z.object({
  title: z.string().min(3).max(16),
  token: z.string()
})