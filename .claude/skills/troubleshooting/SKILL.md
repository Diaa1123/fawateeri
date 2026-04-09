---
name: troubleshooting
description: تشخيص وحل المشاكل الشائعة في مشاريع Next.js + Airtable. يُستخدم تلقائياً عند ظهور أخطاء، توقف السيرفر، بطء الأداء، مشاكل Airtable API، أخطاء البناء (build)، مشاكل النشر (deployment)، أو أي خطأ في الـ terminal أو المتصفح. يشمل أيضاً مشاكل Google Drive, OpenAI API, Make.com, Git, وأخطاء TypeScript.
---

# تشخيص وحل المشاكل — Troubleshooting

## متى تُستخدم هذه المهارة
- عند ظهور أي خطأ في terminal أو متصفح
- عند توقف `npm run dev` أو بطء الجهاز
- عند فشل `npm run build`
- عند مشاكل Airtable API أو Google Drive
- عند مشاكل النشر على Vercel أو VPS
- عند مشاكل الربط مع خدمات خارجية (Make.com, OpenAI)

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

## 3. مشاكل Airtable API

### المشكلة: 401 Unauthorized

```
Error: AIRTABLE_API_KEY is not set or invalid
```

**الحل:**
```bash
# 1. تحقق من .env.local:
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# 2. تأكد إن الـ API key من النوع الصحيح:
# Airtable ← Account ← Generate API key
# استخدم Personal Access Token (pat...)

# 3. تحقق من الصلاحيات:
# الـ token لازم يكون له read/write على الـ Base
```

### المشكلة: 422 Unprocessable Entity

```
Error: The formula contains an invalid field name
```

**الحل:**
```typescript
// تحقق إن أسماء الحقول مطابقة تماماً للي في Airtable
// Airtable case-sensitive: "invoice_number" ≠ "Invoice_Number"

// ✅ صح
const response = await fetch(url, {
  body: JSON.stringify({
    fields: {
      invoice_number: "INV-001",  // نفس الاسم في Airtable
      vendor_name: "شركة التوريدات"
    }
  })
});
```

### المشكلة: Rate Limiting (429)

```
Error: You have exceeded the rate limit
```

**الحل:**
```typescript
// Airtable limits: 5 requests/second
// استخدم debouncing أو queue:

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function batchCreateInvoices(invoices: Invoice[]) {
  for (const invoice of invoices) {
    await createInvoice(invoice);
    await sleep(200); // 5 requests/sec = 200ms بين كل طلب
  }
}
```

### المشكلة: استدعاءات كثيرة للـ API

```typescript
// ❌ بطيء — استدعاء لكل فاتورة
for (const id of invoiceIds) {
  const invoice = await getInvoice(id);
}

// ✅ سريع — استدعاء واحد مع filter
const invoices = await getInvoices({
  filterByFormula: `OR(${invoiceIds.map(id => `RECORD_ID()="${id}"`).join(',')})`
});

// ✅ أو استخدم TanStack Query للتخزين المؤقت:
const { data } = useQuery({
  queryKey: ['invoices'],
  queryFn: getInvoices,
  staleTime: 30000, // 30 ثانية
});
```

---

## 4. مشاكل Google Drive API

### المشكلة: رفع PDF يفشل

```
Error: invalid_grant
```

**الحل:**
```bash
# 1. تحقق من credentials:
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# 2. Private key لازم يحتوي على \n حقيقية:
# في .env.local استخدم:
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# 3. تأكد إن Service Account عنده صلاحية:
# Google Drive ← Folder ← Share ← أضف service account email
```

### المشكلة: Folder not found

```
Error: File not found (404)
```

**الحل:**
```bash
# الـ GOOGLE_DRIVE_FOLDER_ID غلط
# اطلع الـ ID من رابط المجلد:
# https://drive.google.com/drive/folders/[FOLDER_ID]

# تأكد إن الـ folder مشارك مع service account
```

---

## 5. مشاكل OpenAI API

### المشكلة: تحليل الفاتورة يفشل

```
Error: Incorrect API key provided
```

**الحل:**
```bash
# تحقق من .env.local:
OPENAI_API_KEY=sk-proj-...

# تأكد إن الـ key من النوع الصحيح (project API key)
# OpenAI Dashboard ← API Keys ← Create new key
```

### المشكلة: استهلاك كبير للـ tokens

```typescript
// ❌ يرسل كل محتوى PDF (قد يكون كبير جداً)
const analysis = await openai.chat.completions.create({
  messages: [{ role: "user", content: pdfFullText }]
});

// ✅ أرسل فقط الجزء المهم
const extractedText = pdfFullText.slice(0, 4000); // أول 4000 حرف
```

### المشكلة: Response بطيء

```typescript
// استخدم streaming للاستجابة الأسرع:
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [...],
  stream: true,
});
```

---

## 6. مشاكل Node Modules والمكتبات

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

## 7. مشاكل Git

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

## 8. مشاكل Make.com


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

## 9. مشاكل النشر (Vercel)

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

### المشكلة: الموقع يشتغل بس Airtable لا

```bash
# تأكد إن environment variables في Vercel:
# AIRTABLE_API_KEY=pat...
# AIRTABLE_BASE_ID=app...
# OPENAI_API_KEY=sk-proj-...
# GOOGLE_SERVICE_ACCOUNT_EMAIL=...
# GOOGLE_PRIVATE_KEY=...

# تحقق إن GOOGLE_PRIVATE_KEY يحتوي على \n حقيقية
```

### المشكلة: صفحات 404 بعد النشر

```bash
# السبب: Dynamic routes تحتاج إعداد
# تأكد إن الملفات مسماة صح:
# [id]/page.tsx  ← صح
# [id].tsx       ← غلط في App Router
```

---

## 10. مشاكل TypeScript

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

## 11. الحل النووي — لما كل شيء يفشل

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

# 6. شغّل
npm run dev
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
- ❌ لا تحذف بيانات Airtable production — اختبر على base منفصل
- ❌ لا تستخدم `--force` بدون ما تفهم ايش يسوي
- ❌ لا ترفع .env على Git — حتى لو test keys
- ❌ لا تتجاهل أخطاء build — لو فشل البناء لا تنشر
- ❌ لا تحدّث كل المكتبات مرة وحدة — حدّث وحدة وحدة واختبر
- ❌ لا تقتل عمليات بـ kill -9 إلا كحل أخير
- ❌ لا تشغّل npm run build بدون داعي — استخدم npm run dev للتطوير
