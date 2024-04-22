import { z } from 'zod';

export type Inputs = z.infer<typeof Schema>

export const Schema = z.object({
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100)
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords does not match'
})
