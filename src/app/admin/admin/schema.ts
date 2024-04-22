import { z } from 'zod';

export type Inputs = z.infer<typeof Schema>

export const Schema = z.object({
  firstname: z.string().min(6).max(100),
  lastname: z.string().min(6).max(100),
  email: z.string().min(1).email(),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100)
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords does not match'
})

export type InputsEdit = z.infer<typeof Schema>

export const SchemaEdit = z.object({
  firstname: z.string().min(6).max(100),
  lastname: z.string().min(6).max(100),
  email: z.string().min(1).email(),
})