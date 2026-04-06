---
name: troubleshooting
description: تشخيص وحل المشاكل الشائعة في مشاريع Next.js + Prisma + Supabase. يُستخدم تلقائياً عند ظهور أخطاء، توقف السيرفر، بطء الأداء، مشاكل قاعدة البيانات، أخطاء البناء (build)، مشاكل النشر (deployment)، أو أي خطأ في الـ terminal أو المتصفح. يشمل أيضاً مشاكل Moyasar, Aramex, Make.com, Git, وأخطاء TypeScript.
---

# تشخيص وحل المشاكل — Troubleshooting

## متى تُستخدم هذه المهارة
- عند ظهور أي خطأ في terminal أو متصفح
- عند توقف `npm run dev` أو بطء الجهاز
- عند فشل `npm run build`
- عند مشاكل قاعدة البيانات أو Prisma
- عند مشاكل النشر على Vercel أو VPS
- عند مشاكل الربط مع خدمات خارجية

## القاعدة الذهبية للتشخيص

قبل أي حل، نفّذ بالترتيب:
```bash
# 1. اقرأ الخطأ كاملاً — السطر الأخير عادةً فيه السبب
# 2. حدد نوع المشكلة من الجدول تحت
# 3. طبّق الحل المناسب
# 4. لو ما اشتغل، انتقل للحل اللي بعده
```

---

## 1. مشاكل npm run dev

### المشكلة: السيرفر يعلق أو الجهاز يبطئ

**التشخيص:**
```bash
# شوف استهلاك Node.js
# Mac/Linux:
top -o mem | grep node

# أو:
ps aux | grep node
```

**الحلول بالترتيب:**

```bash
# الحل 1: شغّل بـ Turbopack (أسرع بكثير)
npx next dev --turbopack

# الحل 2: نظّف وأعد التشغيل
rm -rf .next
npm run dev

# الحل 3: نظّف كل شيء
rm -rf node_modules .next
rm package-lock.json
npm install
npm run dev

# الحل 4: قتل كل عمليات Node العالقة
# Mac/Linux:
killall node
# Windows:
taskkill /f /im node.exe

npm run dev
```

**الحل الدائم — أضف في package.json:**
```json
{
  "scripts": {
    "dev": "next dev --turbopack"
  }
}
```

**الحل الدائم — أضف في next.config.js:**
```javascript
const nextConfig = {
  watchOptions: {
    ignored: ['**/node_modules', '**/.git', '**/docs', '**/.claude'],
  },
};
```

### المشكلة: Port 3000 مستخدم

```
Error: listen EADDRINUSE: address already in use :::3000
```

**الحل:**
```bash
# اعرف مين يستخدم البورت
# Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /f /pid <PID>

# أو شغّل على بورت ثاني
npx next dev -p 3001
```

### المشكلة: Hot Reload ما يشتغل

```bash
# الحل 1: تأكد إن الملف محفوظ
# الحل 2: أعد تشغيل السيرفر
Ctrl + C
npm run dev

# الحل 3: امسح cache
rm -rf .next
npm run dev

# الحل 4: لو على Windows — مشكلة file watching
# أضف في next.config.js:
const nextConfig = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};
```

---

## 2. مشاكل npm run build

### المشكلة: Build يفشل

**أهم قاعدة:** `npm run build` أصرم من `npm run dev`. أشياء تشتغل في dev ممكن تفشل في build.

**الأخطاء الشائعة:**

```
Type error: Property 'x' does not exist on type 'y'
```
**الحل:** فيه خطأ TypeScript — صلّح النوع أو أضف النوع الصحيح. **لا تستخدم `any`.**

```
Error: 'useEffect' is not defined
```
**الحل:** ناقص `"use client"` في أعلى الملف.

```
Error: Hydration mismatch
```
**الحل:** فيه فرق بين السيرفر والمتصفح. الأسباب الشائعة:
```tsx
// ❌ هذا يسبب المشكلة
<p>{new Date().toLocaleString()}</p>

// ✅ الحل: استخدم useEffect أو suppressHydrationWarning
<p suppressHydrationWarning>{new Date().toLocaleString()}</p>

// ✅ أو الأفضل:
const [time, setTime] = useState<string>("");
useEffect(() => {
  setTime(new Date().toLocaleString());
}, []);
```

```
Error: Dynamic server usage
```
**الحل:** الصفحة تحاول تكون static لكن فيها شيء dynamic:
```tsx
// أضف في أعلى الصفحة:
export const dynamic = "force-dynamic";
```

### المشكلة: Build بطيء جداً

```bash
# شوف وين البطء
ANALYZE=true npm run build

# حلول:
# 1. تأكد ما فيه imports غير مستخدمة
# 2. استخدم dynamic imports للمكونات الكبيرة
import dynamic from "next/dynamic";
const HeavyComponent = dynamic(() => import("./HeavyComponent"));
```

---

## 3. مشاكل Prisma

### المشكلة: Prisma Client ما يتعرف على الحقول الجديدة

```
Unknown field 'newField' on model 'Product'
```

**الحل:**
```bash
# لازم تولّد الـ client بعد كل تعديل على schema
npx prisma generate

# لو عدّلت schema ← لازم migration كمان
npx prisma migrate dev --name describe_what_changed
```

### المشكلة: Migration فاشلة

```
Error: P3009 migrate found failed migrations
```

**الحل:**
```bash
# الحل 1: أعد المحاولة
npx prisma migrate dev

# الحل 2: لو في بيئة التطوير فقط — ارجع من الصفر
npx prisma migrate reset
# ⚠️ هذا يمسح كل البيانات! لا تسويه في production

# الحل 3: صلّح يدوي
npx prisma migrate resolve --rolled-back "migration_name"
```

### المشكلة: كثرة اتصالات قاعدة البيانات في dev

```
Error: Too many connections / PrismaClientInitializationError
```

**الحل — استخدم singleton:**
```typescript
// src/server/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" 
      ? ["warn", "error"] 
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
```

### المشكلة: Prisma بطيء

```bash
# شوف الـ queries البطيئة
# أضف في PrismaClient:
new PrismaClient({
  log: [{ level: "query", emit: "stdout" }],
});

# الأسباب الشائعة:
# 1. N+1 queries — استخدم include بدل queries متكررة
# 2. ناقص index على حقل تفلتر عليه
# 3. تجلب بيانات أكثر من اللازم — استخدم select
```

**مثال N+1:**
```typescript
// ❌ بطيء — query لكل منتج
const orders = await db.order.findMany();
for (const order of orders) {
  const products = await db.product.findMany({
    where: { orderId: order.id },
  });
}

// ✅ سريع — query واحد
const orders = await db.order.findMany({
  include: { products: true },
});
```

---

## 4. مشاكل Supabase

### المشكلة: Auth ما يشتغل

```
AuthApiError: Invalid login credentials
```

**تحقق من:**
```bash
# 1. المفاتيح صحيحة في .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 2. Email confirmations معطلة في التطوير
# Supabase Dashboard ← Auth ← Settings ← 
# أطفئ "Enable email confirmations" للتطوير

# 3. Redirect URLs مضافة
# Supabase Dashboard ← Auth ← URL Configuration
# أضف: http://localhost:3000/**
```

### المشكلة: Storage — رفع الصور يفشل

```
StorageApiError: new row violates row-level security policy
```

**الحل:**
```sql
-- في Supabase SQL Editor — أضف policy للرفع
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- وللقراءة العامة
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');
```

---

## 5. مشاكل Node Modules والمكتبات

### المشكلة: مكتبات متضاربة

```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**الحل:**
```bash
# الحل 1: حاول بـ legacy-peer-deps
npm install --legacy-peer-deps

# الحل 2: نظّف كل شيء
rm -rf node_modules package-lock.json
npm install

# الحل 3: شوف التضارب بالتفصيل
npm ls <package-name>
```

### المشكلة: مكتبة قديمة تسبب أخطاء

```bash
# شوف كل المكتبات القديمة
npm outdated

# حدّث مكتبة محددة
npm install <package>@latest

# حدّث الكل (بحذر)
npx npm-check-updates -u
npm install
```

### المشكلة: Module not found

```
Module not found: Can't resolve 'xxx'
```

**الحلول:**
```bash
# 1. المكتبة مو مثبتة
npm install xxx

# 2. المسار غلط — تحقق من:
# - الحروف الكبيرة والصغيرة (case sensitive)
# - المسار النسبي (../../ بدل @/)

# 3. لو تستخدم @ paths — تأكد من tsconfig.json:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 6. مشاكل Git

### المشكلة: الـ Agent خرّب ملفات

```bash
# ارجع لآخر commit (يلغي كل التعديلات)
git checkout .

# أو ارجع ملف محدد
git checkout -- src/app/page.tsx

# لو سوّى commit غلط — ارجع commit واحد
git reset --soft HEAD~1
```

### المشكلة: Merge conflict

```bash
# 1. شوف الملفات المتضاربة
git status

# 2. افتح الملف — بتلاقي:
<<<<<<< HEAD
الكود الحالي
=======
الكود الجديد
>>>>>>> branch-name

# 3. اختر اللي تبيه واحذف العلامات
# 4. ثم:
git add .
git commit -m "resolve merge conflict"
```

### المشكلة: نسيت أضيف .env في .gitignore

```bash
# ⚠️ لو رفعت .env على GitHub — المفاتيح انكشفت
# غيّر كل المفاتيح فوراً!

# أضف في .gitignore:
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# احذف من Git (بدون حذف الملف)
git rm --cached .env.local
git commit -m "remove env from tracking"
```

---

## 7. مشاكل Moyasar

### المشكلة: الدفع يرجع خطأ

```
# تأكد إنك في الوضع الصحيح
# تطوير: pk_test_ / sk_test_
# إنتاج: pk_live_ / sk_live_

# ⚠️ لا تخلط بينهم!
```

### المشكلة: المبلغ غلط

```typescript
// ⚠️ السبب الأكثر شيوعاً: نسيت تحويل الريالات للهللات
// Moyasar يتعامل بالهللات

// ❌ غلط — يخصم 1.5 ريال بدل 150
amount: 150

// ✅ صح — يخصم 150 ريال
amount: 150 * 100  // = 15000 هللة
```

### المشكلة: Callback ما يرجع

```typescript
// تأكد إن callback_url صحيح ويشتغل
// في التطوير: http://localhost:3000/api/payment/callback
// في الإنتاج: https://banafsaj.com/api/payment/callback

// ⚠️ Moyasar ما يقدر يوصل localhost
// للتجربة المحلية استخدم ngrok:
npx ngrok http 3000
// واستخدم الرابط اللي يعطيك كـ callback
```

---

## 8. مشاكل Aramex

### المشكلة: Error 400 عند إنشاء شحنة

```typescript
// السبب الأشهر: حقول عربية في الـ request
// ❌ أرامكس ما يقبل
City: "جدة"

// ✅ استخدم إنجليزي
City: "Jeddah"

// السبب الثاني: حقول ناقصة
// Aramex يطلب كل هذي:
// - PersonName
// - PhoneNumber1
// - CellPhone (حتى لو نفس الرقم)
// - Line1 (العنوان)
// - City
// - CountryCode
```

### المشكلة: Tracking ما يرجع بيانات

```typescript
// الشحنة تحتاج وقت تتسجل في نظام أرامكس
// انتظر 30-60 دقيقة بعد إنشاء الشحنة
// ثم حاول التتبع

// لو بعد ساعة ما فيه بيانات:
// تحقق إن رقم التتبع صحيح
// تحقق إن الـ credentials صحيحة
```

---

## 9. مشاكل Make.com

### المشكلة: Webhook ما يوصل

```bash
# 1. تأكد إن الـ Scenario شغّال (Active)
# 2. تأكد إن الرابط صحيح
# 3. جرب بـ curl:
curl -X POST https://hook.eu2.make.com/xxx \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 4. لو يوصل بـ curl بس مو من الكود:
# تحقق إن Content-Type محدد
headers: { "Content-Type": "application/json" }
```

### المشكلة: Make.com يعيد المحاولة ويكرر العملية

```typescript
// Make.com يعيد على 4xx/5xx
// ⚠️ دائماً أرجع 200 حتى لو فيه خطأ داخلي

export async function POST(req: Request) {
  try {
    const data = await req.json();
    await processWebhook(data);
    return Response.json({ success: true }); // 200
  } catch (error) {
    console.error("Webhook error:", error);
    // أرجع 200 عشان ما يعيد المحاولة
    return Response.json({ success: false, error: "logged" }); // 200
  }
}
```

---

## 10. مشاكل النشر (Vercel)

### المشكلة: Build يفشل على Vercel بس يشتغل محلي

```bash
# السبب 1: Environment Variables ناقصة
# Vercel ← Settings ← Environment Variables
# أضف كل اللي في .env.local

# السبب 2: Case sensitivity
# Mac ما يفرق بين Page.tsx و page.tsx
# Linux (Vercel) يفرق!
# ✅ دائماً استخدم lowercase لأسماء الملفات

# السبب 3: Prisma client مو متولّد
# أضف في package.json:
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### المشكلة: الموقع يشتغل بس قاعدة البيانات لا

```bash
# تأكد إن DATABASE_URL في Vercel env vars
# تأكد إن قاعدة البيانات تقبل اتصالات خارجية
# Supabase: يقبل تلقائياً
# VPS: تأكد إن PostgreSQL يسمع على 0.0.0.0

# لو تستخدم connection pooling (مهم للإنتاج):
# استخدم Supabase pooler URL:
# DATABASE_URL=postgres://...pooler.supabase.com:6543/...?pgbouncer=true
```

### المشكلة: صفحات 404 بعد النشر

```bash
# السبب: Dynamic routes تحتاج إعداد
# تأكد إن الملفات مسماة صح:
# [id]/page.tsx  ← صح
# [id].tsx       ← غلط في App Router
```

---

## 11. مشاكل TypeScript

### المشكلة: أخطاء كثيرة بعد تحديث المكتبات

```bash
# الحل السريع: تحقق من التوافق
npx tsc --noEmit

# لو أخطاء كثيرة في node_modules:
# أضف في tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

### المشكلة: params في Next.js 15 يعطي خطأ

```typescript
// Next.js 15 غيّر params لـ Promise

// ❌ قديم (Next.js 14)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}

// ✅ جديد (Next.js 15)
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
}
```

---

## 12. الحل النووي — لما كل شيء يفشل

```bash
# 1. أوقف كل شيء
killall node 2>/dev/null

# 2. احذف كل الملفات المؤقتة
rm -rf node_modules .next .turbo

# 3. احذف lock file
rm package-lock.json

# 4. نظّف npm cache
npm cache clean --force

# 5. أعد التثبيت
npm install

# 6. أعد توليد Prisma
npx prisma generate

# 7. شغّل
npm run dev --turbopack
```

**لو بعد كل هذا ما اشتغل:**
```bash
# شغّل npm run build وشوف الأخطاء بالتفصيل
npm run build 2>&1 | head -50

# الخطأ الأول هو اللي تحتاج تصلحه
# الأخطاء اللي بعده غالباً تنحل معه
```

---

## الممنوعات
- ❌ لا تحذف قاعدة بيانات production — migrate reset فقط في dev
- ❌ لا تستخدم `--force` بدون ما تفهم ايش يسوي
- ❌ لا ترفع .env على Git — حتى لو test keys
- ❌ لا تتجاهل أخطاء build — لو فشل البناء لا تنشر
- ❌ لا تحدّث كل المكتبات مرة وحدة — حدّث وحدة وحدة واختبر
- ❌ لا تقتل عمليات بـ kill -9 إلا كحل أخير
