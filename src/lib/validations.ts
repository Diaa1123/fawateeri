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
  // Core fields
  vendor_name: z.string().min(1, 'اسم المورد مطلوب'),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.string().default('SAR'),
  invoice_date: z.string().min(1, 'تاريخ الفاتورة مطلوب'),
  due_date: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  notes: z.string().optional().default(''),
  source: z.string().optional().default('يدوي'),

  // Vendors table fields (optional)
  payment_URL: z.string().optional(),
  email: z.string().optional(),
  currency_preference: z.string().optional(),
  invoice_file: z.any().optional(),

  // Invoices table fields (optional - for backward compatibility)
  pdf_url: z.string().optional(),
  payment_link: z.string().optional(),
});
