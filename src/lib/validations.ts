import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل').max(50, 'اسم المستخدم يجب ألا يتجاوز 50 حرف'),
  display_name: z.string().min(2, 'الاسم المعروض يجب أن يكون حرفين على الأقل').max(100, 'الاسم المعروض يجب ألا يتجاوز 100 حرف'),
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(['admin', 'viewer', 'team'], { message: 'الدور يجب أن يكون: admin أو viewer أو team' }),
});

export const updateUserSchema = z.object({
  display_name: z.string().min(2, 'الاسم المعروض يجب أن يكون حرفين على الأقل').max(100, 'الاسم المعروض يجب ألا يتجاوز 100 حرف').optional(),
  password: z.string().min(6, 'كلمة السر يجب أن تكون 6 أحرف على الأقل').optional(),
  role: z.enum(['admin', 'viewer', 'team'], { message: 'الدور يجب أن يكون: admin أو viewer أو team' }).optional(),
  is_active: z.boolean().optional(),
});

export const createInvoiceSchema = z.object({
  invoice_number: z.string().default(''),
  vendor_name: z.string().default(''),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.string().default('SAR'),
  invoice_date: z.string().default(''),
  due_date: z.string().default(''),
  pdf_url: z.string().default(''),
  payment_link: z.string().default(''),
  notes: z.string().default(''),
  source: z.string().default('يدوي'),
});
