# Backend Agent — برمبت التنفيذ

> هذا البرمبت لـ Backend Agent لتنفيذ المهام 1.1a, 1.2a, 1.3a

---

## 🎯 مهمتك

أنت **Backend Agent** مسؤول عن بناء الـ Backend الخاص بمشروع **فواتيري**.

**المهام المطلوبة في هذه الجلسة (حد أقصى 3 مهام):**
1. **1.1a** — إعداد Airtable client + types + env vars
2. **1.2a** — نظام المصادقة (JWT) — login + middleware + role check
3. **1.3a** — API إدارة المستخدمين (CRUD) — أدمن فقط

---

## 📚 الملفات الإلزامية للقراءة

**اقرأ هذه الملفات بالترتيب قبل البدء:**

1. **`CLAUDE.md`** — القواعد العامة للمشروع (التقنيات، الممنوعات، قواعد الكود)
2. **`docs/MASTER-PLAN.md`** — الخطة الرئيسية للمشروع
3. **`docs/CURRENT-PHASE.md`** — المرحلة الحالية (المرحلة 1)
4. **`docs/backend_tasks.md`** — مهامك المفصلة
5. **`docs/backend_logs.md`** — سجل التقدم (ستكتب فيه بعد كل مهمة)

---

## 📋 تفاصيل المهام

### المهمة 1.1a — إعداد Airtable client + types + env vars

**الهدف:** إنشاء نظام الاتصال بـ Airtable مع TypeScript types كاملة.

**الملفات المطلوبة:**
```
src/
  lib/
    airtable.ts          ← Airtable REST API client
  types/
    invoice.ts           ← Invoice types
    user.ts              ← User types
    api.ts               ← API response types
.env.example             ← متغيرات البيئة المطلوبة
```

**المتطلبات التفصيلية:**

#### 1. `src/types/invoice.ts`
```typescript
export type InvoiceStatus = "جديدة" | "مدفوعة";
export type InvoiceSource = "إيميل" | "يدوي";

export interface Invoice {
  id: string;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  currency: string;
  invoice_date: string;        // ISO date
  due_date: string;            // ISO date
  status: InvoiceStatus;
  pdf_url: string;
  payment_link?: string;
  uploaded_by: string;
  uploaded_at: string;
  paid_at?: string;
  paid_by?: string;
  notes?: string;
  source: InvoiceSource;
  month_year: string;          // "2026-04"
}
```

#### 2. `src/types/user.ts`
```typescript
export type UserRole = "admin" | "viewer" | "team";

export interface User {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserPayload {
  userId: string;
  username: string;
  role: UserRole;
}
```

#### 3. `src/types/api.ts`
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  records: T[];
  offset?: string;
}
```

#### 4. `src/lib/airtable.ts`

**الوظائف المطلوبة:**
```typescript
// Generic Airtable functions
export async function listRecords<T>(
  tableName: string,
  options?: {
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    maxRecords?: number;
    offset?: string;
  }
): Promise<PaginatedResponse<T>>

export async function getRecord<T>(
  tableName: string,
  recordId: string
): Promise<T>

export async function createRecord<T>(
  tableName: string,
  fields: Partial<T>
): Promise<T>

export async function updateRecord<T>(
  tableName: string,
  recordId: string,
  fields: Partial<T>
): Promise<T>

export async function deleteRecord(
  tableName: string,
  recordId: string
): Promise<void>
```

**المواصفات:**
- استخدام `fetch` API مباشرة (بدون SDK)
- Airtable REST API v0: `https://api.airtable.com/v0/{baseId}/{tableName}`
- Headers:
  ```typescript
  {
    'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
  ```
- Error handling موحد: try/catch مع رسائل واضحة
- TypeScript strict mode (لا `any`)

#### 5. `.env.example`
```env
# Airtable
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_base_id_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ ملاحظات مهمة:**
- لا تثبت أي مكتبة Airtable SDK — نستخدم REST API مباشرة
- كل الـ types يجب أن تكون صارمة (strict)
- الأرقام تُخزن كأرقام، التواريخ كـ ISO strings

---

### المهمة 1.2a — نظام المصادقة (JWT)

**الهدف:** نظام مصادقة كامل بـ JWT + middleware + role-based access.

**الملفات المطلوبة:**
```
src/
  lib/
    auth.ts                        ← JWT utilities
  app/
    api/
      auth/
        login/
          route.ts                 ← POST /api/auth/login
middleware.ts                      ← حماية routes
```

**المتطلبات التفصيلية:**

#### 1. `src/lib/auth.ts`

المكتبات المطلوبة:
- `jose` — للـ JWT (already in package.json حسب CLAUDE.md)
- `bcryptjs` — لهاش كلمات السر

الوظائف المطلوبة:
```typescript
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// Hash password
export async function hashPassword(password: string): Promise<string>

// Compare password
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean>

// Sign JWT token
export async function signToken(payload: UserPayload): Promise<string>

// Verify JWT token
export async function verifyToken(token: string): Promise<UserPayload | null>

// Get user from Airtable by username
export async function getUserByUsername(username: string): Promise<User | null>
```

**المواصفات:**
- JWT payload: `{ userId, username, role, exp }`
- Expiry: 7 days
- Secret من `.env`: `JWT_SECRET`

#### 2. `src/app/api/auth/login/route.ts`

```typescript
export async function POST(request: Request) {
  // 1. Parse body: { username, password }
  // 2. Validate inputs
  // 3. Get user from Airtable
  // 4. Check if user exists && is_active
  // 5. Compare password
  // 6. Sign JWT
  // 7. Return: { success: true, token, user: { username, role } }
}
```

**Response format:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "username": "diaa",
    "role": "admin"
  }
}
```

#### 3. `middleware.ts` (في الجذر)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Check if route needs protection
  // 2. Get token from Authorization header or cookie
  // 3. Verify token
  // 4. Check role permissions
  // 5. Allow or deny
}

export const config = {
  matcher: [
    '/api/:path*',           // Protect all API routes
    '/(dashboard|admin)/:path*'  // Protect dashboard routes
  ],
};
```

**Protected routes:**
- `/api/*` — الكل (ما عدا `/api/auth/login`, `/api/webhook/make`)
- `/api/users/*` — admin فقط
- `/(admin)/*` — admin فقط

**⚠️ ملاحظات:**
- استخدم `NextResponse.next()` للسماح
- استخدم `NextResponse.json({ error: "Unauthorized" }, { status: 401 })` للرفض
- أضف `x-user-id`, `x-user-role` في headers للـ route handlers

---

### المهمة 1.3a — API إدارة المستخدمين

**الهدف:** CRUD كامل للمستخدمين (admin فقط).

**الملفات المطلوبة:**
```
src/
  app/
    api/
      users/
        route.ts           ← GET (list), POST (create)
        [id]/
          route.ts         ← GET (single), PATCH (update), DELETE (disable)
```

**المتطلبات التفصيلية:**

#### 1. `src/app/api/users/route.ts`

**GET** — قائمة المستخدمين
```typescript
export async function GET(request: Request) {
  // 1. Check role من headers (admin فقط)
  // 2. Get all users from Airtable (Users table)
  // 3. Remove password_hash من النتائج
  // 4. Return: { success: true, data: users[] }
}
```

**POST** — إنشاء مستخدم جديد
```typescript
export async function POST(request: Request) {
  // 1. Check role (admin فقط)
  // 2. Parse body: { username, display_name, password, role }
  // 3. Validate inputs (Zod schema في lib/validations.ts)
  // 4. Hash password
  // 5. Create user في Airtable
  // 6. Return: { success: true, data: user }
}
```

#### 2. `src/app/api/users/[id]/route.ts`

**GET** — مستخدم واحد
```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Check role (admin فقط)
  // 2. Get user from Airtable
  // 3. Remove password_hash
  // 4. Return user
}
```

**PATCH** — تعديل مستخدم
```typescript
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Check role (admin فقط)
  // 2. Parse body: { display_name?, role?, is_active? }
  // 3. Update في Airtable
  // 4. Return updated user
}
```

**DELETE** — تعطيل مستخدم (soft delete)
```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1. Check role (admin فقط)
  // 2. Update is_active = false في Airtable
  // 3. Return: { success: true }
}
```

#### 3. `src/lib/validations.ts` (جديد)

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  display_name: z.string().min(2).max(100),
  password: z.string().min(8),
  role: z.enum(['admin', 'viewer', 'team']),
});

export const updateUserSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  role: z.enum(['admin', 'viewer', 'team']).optional(),
  is_active: z.boolean().optional(),
});
```

---

## ✅ معايير الإكمال

**المهمة تُعتبر مكتملة عندما:**

### 1.1a ✓
- [ ] كل الـ types معرّفة بدون `any`
- [ ] Airtable client يشتغل ويستطيع list, get, create, update, delete
- [ ] `.env.example` موجود بكل المتغيرات

### 1.2a ✓
- [ ] تقدر تسجّل دخول بـ username + password
- [ ] الـ API يرجع JWT صحيح
- [ ] Middleware يحمي routes ويرفض لو ما فيه token
- [ ] Role check يشتغل (admin يوصل، غيره لا)

### 1.3a ✓
- [ ] API يرجع قائمة المستخدمين (admin فقط)
- [ ] تقدر تضيف مستخدم جديد بـ hashed password
- [ ] تقدر تعدّل display_name, role, is_active
- [ ] تقدر تعطّل مستخدم (soft delete)

---

## 📝 التسجيل

**بعد كل مهمة:**
1. حدّث `docs/backend_tasks.md` — غيّر `[ ]` إلى `[x]`
2. سجّل في `docs/backend_logs.md`:
   ```markdown
   ### المهمة 1.1a — إعداد Airtable client ✅
   **التاريخ**: 2026-04-04
   **المدة**: 35 دقيقة
   **الملفات المُنشأة**:
   - src/lib/airtable.ts
   - src/types/invoice.ts
   - src/types/user.ts
   - src/types/api.ts
   - .env.example

   **الملاحظات**:
   - استخدمت fetch API مباشرة
   - Types كلها strict بدون any
   - Error handling موحد
   ```

---

## ⚠️ قواعد مهمة

### الممنوعات:
- ❌ لا تثبت أي SDK لـ Airtable
- ❌ لا تستخدم `any` في TypeScript
- ❌ لا تنفّذ أكثر من 3 مهام
- ❌ لا console.log في الكود النهائي
- ❌ لا NextAuth أو أي auth library — فقط JWT يدوي

### المطلوب:
- ✅ استخدم التقنيات المحددة في CLAUDE.md فقط
- ✅ اتبع نظام الملفات في CLAUDE.md
- ✅ Error handling في كل API route
- ✅ Validation بـ Zod
- ✅ TypeScript strict mode

---

## 🚀 ابدأ الآن

**الترتيب:**
1. اقرأ الملفات الـ 5 المذكورة في الأعلى
2. نفّذ 1.1a
3. سجّل في logs
4. نفّذ 1.2a
5. سجّل في logs
6. نفّذ 1.3a
7. سجّل في logs
8. أبلغ مدير المشروع: "تم إكمال 3 مهام Backend"

---

**ملاحظة نهائية:** لا تنسَ قراءة `CLAUDE.md` بالكامل — فيه قواعد حرجة خاصة بالمشروع!
