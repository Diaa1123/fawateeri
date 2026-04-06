# CLAUDE.md — فواتيري (Fawateeri)

> هذا الملف هو المرجع الأساسي للـ Agent. يُقرأ تلقائياً قبل أي مهمة.
> آخر تحديث: أبريل 2026

---

## نظرة عامة على المشروع

**اسم المشروع**: فواتيري — Fawateeri
**الوصف**: نظام داخلي لإدارة الفواتير — يجمع الفواتير تلقائياً من الإيميلات عبر Make.com، يخزن مرفقات PDF في Google Drive، يستخدم AI لتحليل محتوى الفواتير واستخراج البيانات تلقائياً، ويعرض كل شيء في واجهة Dashboard داكنة واحترافية.
**الجمهور المستهدف**: فريق العمل الداخلي (أدمن + مشاهدين + فريق)
**نموذج الربح**: أداة داخلية — لا يوجد نموذج ربح

---

## أنواع المستخدمين والصلاحيات

| النوع | الدور | الصلاحيات |
|-------|-------|-----------|
| أدمن (ضياء) | متحكم كامل | كل شيء: إدارة المستخدمين، تعديل حالات الفواتير، حذف، إعدادات النظام |
| مشاهد (مدير + مراجع) | مشاهدة + تعديل حالات | مشاهدة كاملة، تعديل حالة الفاتورة لـ "مدفوعة"، الوصول لروابط الدفع |
| فريق (موظفين) | إضافة فقط | إضافة فواتير جديدة عبر صفحة الإضافة فقط — لا يشوف التقارير ولا الأرشيف |

### إدارة المستخدمين
- الأدمن يضيف المستخدمين يدوياً من داخل المنصة
- الأدمن يحدد اسم المستخدم + كلمة السر + نوع الصلاحية
- لا يوجد تسجيل ذاتي — النظام مغلق

---

## التقنيات المستخدمة

- **Framework**: Next.js 16.2.2 (App Router)
- **Language**: TypeScript 6.0.2 (strict mode)
- **Styling**: Tailwind CSS 3.4.17 + PostCSS 8.4.49 + Autoprefixer 10.4.20
- **Charts**: Recharts 3.8.1
- **Data Fetching**: TanStack Query 5.96.2
- **Forms**: React Hook Form 7.72.1 + Zod 4.3.6
- **Auth**: Jose 6.2.2 (JWT) + bcryptjs 3.0.3 (هاش كلمات السر)
- **Icons**: Lucide React 1.7.0
- **Database**: Airtable (عبر Airtable REST API)
- **AI**: OpenAI API — GPT-4o (لتحليل محتوى الفواتير)
- **Storage**: Google Drive API (لتخزين PDF)

### ⚠️ لا نستخدم في هذا المشروع:
- ❌ Prisma (البيانات في Airtable)
- ❌ tRPC (API بسيط، Route Handlers تكفي)
- ❌ PostgreSQL / Supabase (Airtable هو قاعدة البيانات)
- ❌ Moyasar / بوابات دفع (النظام لا يعالج مدفوعات)
- ❌ أي animations أو framer-motion

---

## بنية المجلدات

```
fawateeri/
├── CLAUDE.md
├── .claude/skills/
├── docs/                          ← 9 ملفات فقط
│   ├── MASTER-PLAN.md
│   ├── CURRENT-PHASE.md
│   ├── DECISIONS.md
│   ├── USER-FLOWS.md
│   ├── backend_tasks.md
│   ├── backend_logs.md
│   ├── UI_tasks.md
│   ├── UI_logs.md
│   └── fixes_log.md
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx       ← صفحة تسجيل الدخول
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         ← Layout مشترك (Sidebar + Header)
│   │   │   ├── page.tsx           ← التقرير الشامل (Dashboard)
│   │   │   ├── invoices/
│   │   │   │   └── page.tsx       ← الفواتير الجديدة
│   │   │   ├── archive/
│   │   │   │   └── page.tsx       ← أرشيف الفواتير المدفوعة
│   │   │   └── add/
│   │   │       └── page.tsx       ← إضافة فاتورة (الكل يوصلها)
│   │   ├── (admin)/
│   │   │   └── users/
│   │   │       └── page.tsx       ← إدارة المستخدمين (أدمن فقط)
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── login/route.ts
│   │   │   ├── invoices/
│   │   │   │   ├── route.ts       ← GET (list) + POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   ← PATCH (update status) + GET (single)
│   │   │   ├── users/
│   │   │   │   └── route.ts       ← CRUD مستخدمين (أدمن فقط)
│   │   │   ├── upload/
│   │   │   │   └── route.ts       ← رفع PDF → Google Drive
│   │   │   ├── ai/
│   │   │   │   └── analyze/route.ts ← تحليل محتوى الفاتورة بالذكاء
│   │   │   └── webhook/
│   │   │       └── make/route.ts  ← استقبال الفواتير من Make.com
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                    ← Button, Input, Modal, Badge, Card, Select, Table
│   │   ├── forms/
│   │   │   └── InvoiceForm.tsx    ← نموذج إضافة فاتورة
│   │   ├── layouts/
│   │   │   ├── Sidebar.tsx        ← قائمة جانبية
│   │   │   ├── Header.tsx         ← الهيدر العلوي
│   │   │   └── MobileNav.tsx      ← قائمة الجوال
│   │   └── shared/
│   │       ├── InvoiceCard.tsx    ← بطاقة فاتورة
│   │       ├── StatsCard.tsx      ← بطاقة إحصائية
│   │       ├── MonthSelector.tsx  ← أزرار اختيار الشهر
│   │       ├── InvoiceTable.tsx   ← جدول الفواتير
│   │       ├── PDFViewer.tsx      ← عارض PDF
│   │       └── EmptyState.tsx     ← حالة فارغة
│   │
│   ├── lib/
│   │   ├── utils.ts               ← دوال مساعدة
│   │   ├── validations.ts         ← Zod schemas
│   │   ├── constants.ts           ← ثوابت (حالات الفاتورة، الأشهر)
│   │   ├── airtable.ts            ← Airtable API client
│   │   ├── google-drive.ts        ← Google Drive API client
│   │   ├── openai.ts              ← OpenAI GPT-4o client (تحليل الفواتير)
│   │   └── auth.ts                ← JWT utilities (sign, verify, middleware)
│   │
│   ├── hooks/
│   │   ├── useInvoices.ts         ← جلب الفواتير
│   │   ├── useStats.ts            ← جلب الإحصائيات
│   │   └── useAuth.ts             ← حالة المصادقة
│   │
│   └── types/
│       ├── invoice.ts             ← أنواع الفاتورة
│       ├── user.ts                ← أنواع المستخدم
│       └── api.ts                 ← أنواع الـ API
│
├── public/
│   └── logo.svg
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## ⚠️ نظام الملفات — 9 ملفات فقط في docs/

```
docs/
├── MASTER-PLAN.md         ← يعدّله مدير المشروع فقط
├── CURRENT-PHASE.md       ← المرحلة الحالية
├── DECISIONS.md           ← قرارات وأسبابها
├── USER-FLOWS.md          ← تدفقات المستخدم
├── backend_tasks.md       ← مهام Backend Agent
├── backend_logs.md        ← سجل Backend Agent
├── UI_tasks.md            ← مهام UI Agent
├── UI_logs.md             ← سجل UI Agent
└── fixes_log.md           ← سجل الإصلاحات
```

### 🚫 ممنوع إنشاء أي ملف آخر
لا ملفات URGENT_FIXES، لا V2، لا WEEK_X، لا REMAINING_TASKS.

---

## ⚠️ نظام توزيع المهام

### عند بداية المشروع أو مرحلة جديدة — نفّذ هذا بالترتيب:

```
1. اقرأ docs/MASTER-PLAN.md
2. اقرأ docs/CURRENT-PHASE.md
3. أنشئ ملفات docs/ التسعة إن لم تكن موجودة
4. وزّع المهام على backend_tasks.md و UI_tasks.md بالنظام
5. ابدأ التنفيذ
```

### نظام الترقيم

```
[رقم المرحلة].[رقم المهمة التسلسلي]

المرحلة 1: 1.1, 1.2, 1.3, ...
المرحلة 2: 2.1, 2.2, 2.3, ...
المرحلة 3: 3.1, 3.2, 3.3, ...
```

### رموز الحالة
```
- [ ]  ← لم يبدأ
- [~]  ← قيد التنفيذ
- [x]  ← مكتمل
- ⏳   ← ينتظر مهمة من Agent آخر
- ⚡   ← بعد إكماله يفتح مهمة لـ Agent آخر
- ✅   ← الاعتمادية مكتملة
- ❌   ← الاعتمادية لم تكتمل بعد
```

---

## ⚠️ حدود التنفيذ — 3 مهام فقط

### القاعدة: لا تنفّذ أكثر من 3 مهام في الجلسة الواحدة

```
الدورة:
  ┌─→ نفّذ مهمة 1
  │   نفّذ مهمة 2
  │   نفّذ مهمة 3
  │       ↓
  │   ⛔ توقف
  │       ↓
  │   سجّل في الـ log
  │   حدّث الـ tasks
  │   حدّث الاعتماديات
  │   أبلغ مدير المشروع
  │       ↓
  │   انتظر الإذن
  │       ↓
  └─← "أكمل" ← نفّذ 3 مهام أخرى
```

---

## قواعد التصميم

### الثيم: داكن احترافي (مستوحى من UI UX Pro Max)

### الألوان
```css
/* الخلفيات */
--bg-primary: #0a0e1a;          /* خلفية رئيسية - كحلي عميق */
--bg-secondary: #111827;        /* خلفية ثانوية - كحلي أفتح */
--bg-card: #1a2035;             /* خلفية البطاقات */
--bg-card-hover: #1f2847;       /* hover على البطاقات */
--bg-sidebar: #0d1220;          /* خلفية القائمة الجانبية */

/* النصوص */
--text-primary: #f1f5f9;        /* نص رئيسي - أبيض مائل */
--text-secondary: #94a3b8;      /* نص ثانوي - رمادي */
--text-muted: #64748b;          /* نص خافت */

/* الألوان الوظيفية */
--accent-blue: #3b82f6;         /* أزرق - أزرار رئيسية */
--accent-blue-glow: #2563eb;    /* أزرق متوهج - hover */
--accent-green: #22c55e;        /* أخضر - مدفوعة/نجاح */
--accent-red: #ef4444;          /* أحمر - تحذير/متأخرة */
--accent-amber: #f59e0b;        /* برتقالي - انتباه/معلقة */
--accent-purple: #8b5cf6;       /* بنفسجي - أرقام مميزة */

/* الحدود */
--border-default: #1e293b;      /* حدود عادية */
--border-accent: #334155;       /* حدود بارزة */

/* التدرجات */
--gradient-header: linear-gradient(135deg, #1a2035 0%, #0f172a 100%);
--gradient-card-highlight: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 100%);
```

### لا أنيميشن
- ❌ لا framer-motion
- ❌ لا transitions معقدة
- ✅ فقط hover بسيط (opacity / background-color)
- ✅ لا أكثر من `transition-colors duration-150`

### الخطوط
- العربي: **IBM Plex Sans Arabic** (من Google Fonts)
- الأرقام: **Tabular nums** (لمحاذاة الأرقام في الجداول)
- حجم أساسي: 14px (Dashboard عادة أصغر)
- ارتفاع السطر: 1.7

### RTL أولاً
- `ps/pe/ms/me` بدل `pl/pr/ml/mr`
- `text-start/text-end` بدل `text-left/text-right`
- الأيقونات الاتجاهية: `rtl:rotate-180`
- كل الـ layout يبدأ من اليمين

### Responsive (ويب + جوال)
- **Mobile-first** approach
- الـ Sidebar يتحول لـ bottom navigation على الجوال
- الجداول تتحول لـ cards على الجوال
- breakpoints: `sm:640 md:768 lg:1024 xl:1280`

### مكونات UI
- كل المكونات في `src/components/ui/`
- لا shadcn/ui (نبنيها يدوياً لأن المشروع صغير)
- البطاقات: `rounded-xl border border-[--border-default] bg-[--bg-card]`
- الأزرار: `rounded-lg px-4 py-2 font-medium`
- الجداول: zebra striping خفيف مع hover

---

## قواعد الكود

### TypeScript
- strict mode دائماً
- لا `any` — استخدم types محددة
- كل API response له type معرّف في `src/types/`

### API Routes
- كل route handler يتحقق من الـ JWT
- كل route يتحقق من الصلاحيات (أدمن / مشاهد / فريق)
- Error handling موحد

### Airtable
- كل التعامل مع Airtable عبر `src/lib/airtable.ts`
- استخدام Airtable REST API مباشرة (بدون SDK)
- Cache مع TanStack Query (staleTime: 30 ثانية)

### الأرقام والتواريخ
- ⚠️ **تم التغيير:** عرض الأرقام والتواريخ بالإنجليزية (1,200.00 SAR)
- استخدام `Intl.NumberFormat('en-US')` للتنسيق
- العملة: SAR (بدلاً من ر.س)
- التواريخ: April 5, 2026 (بدلاً من ٥ أبريل ٢٠٢٦)
- السبب: قرار من العميل لتوحيد التنسيق

### Middleware والمصادقة
- **الملف الرئيسي:** `middleware.ts`
- **المسارات العامة (publicPaths):**
  - `/login` - صفحة تسجيل الدخول
  - `/api/auth/login` - API تسجيل الدخول
  - `/api/webhook/make` - Webhook من Make.com
- **Matcher:**
  ```typescript
  matcher: [
    '/api/:path*',     // جميع API routes
    '/',               // Dashboard
    '/invoices',       // صفحة الفواتير الجديدة
    '/archive',        // صفحة الأرشيف
    '/add',            // صفحة إضافة فاتورة
    '/users',          // صفحة إدارة المستخدمين
  ]
  ```
- **⚠️ مهم:** Route groups مثل `(dashboard)` و `(admin)` **لا تظهر** في الـ URL!
  - المجلد: `src/app/(dashboard)/page.tsx`
  - الـ URL الفعلي: `/` (وليس `/dashboard`)
  - لذلك استخدم المسارات الفعلية في الـ matcher
- **صلاحيات فريق العمل:**
  - فريق العمل (role: 'team') محصور في `/add` فقط
  - عند محاولة الوصول لصفحات أخرى → redirect لـ `/add`
  - لا يرى Sidebar أو Header
  - يمكنه فقط POST لـ `/api/invoices` (لا GET)

---

## قواعد المكتبات

### قبل تثبيت أي مكتبة:
1. `npm info <package> version`
2. `npm install <package>@latest`
3. سجّل في الـ log: الاسم + الإصدار + السبب
4. تحقق إنها ليست deprecated

### الإصدارات المعتمدة:
- next: 16.2.2
- react: 19.2.4
- typescript: 6.0.2
- **tailwindcss: 3.4.17** ⚠️ (تم التراجع من 4.2.2 بسبب Turbopack issues)
- postcss: 8.4.49
- autoprefixer: 10.4.20
- recharts: 3.8.1
- @tanstack/react-query: 5.96.2
- react-hook-form: 7.72.1
- zod: 4.3.6
- jose: 6.2.2
- bcryptjs: 3.0.3
- lucide-react: 1.7.0

---

## ⛔ الممنوعات

### ملفات لا تُعدّل بدون إذن:
- `CLAUDE.md`, `.env`, `next.config.js`, `tsconfig.json`

### ممارسات ممنوعة:
- ❌ إنشاء ملفات .md خارج الـ 9 المحددة
- ❌ تنفيذ أكثر من 3 مهام بدون إبلاغ وإذن
- ❌ تنفيذ مهمة اعتماديتها ❌
- ❌ القفز بين المراحل
- ❌ تثبيت مكتبات بدون سبب وإصدار
- ❌ استخدام `any` في TypeScript
- ❌ حذف ملفات بدون إذن
- ❌ ترك `console.log` في الكود النهائي
- ❌ استخدام pl/pr/ml/mr بدل ps/pe/ms/me
- ❌ رسائل نظام بالإنجليزي للمستخدم العربي
- ❌ عرض أرقام إنجليزية (1,200) بدل عربية (١٬٢٠٠)
- ❌ git push --force بدون إذن
- ❌ العمل على main مباشرة
- ❌ أي أنيميشن أو transitions معقدة
- ❌ shadcn/ui أو أي مكتبة UI كبيرة
- ❌ لا تستخدم npm run build استخدم للاختبار npm run dev فقط
لا تشغّل npm run dev بنفسك. أنا بشغّله يدوياً في ترمنال ثاني. أنت ركّز على كتابة الكود فقط ولا تسوي build أو dev server.

---

## أوامر مفيدة

```bash
npm run dev --turbopack
npm run build
npm info <pkg> version
git checkout -b feature/x
git add . && git commit -m "x"
```

---

## Webhook من Make.com

### الـ endpoint: `/api/webhook/make`
### الـ method: POST
### الـ body المتوقع:

```json
{
  "invoice_number": "INV-2026-001",
  "vendor_name": "شركة التوريدات",
  "amount": 5000.00,
  "currency": "SAR",
  "invoice_date": "2026-04-01",
  "due_date": "2026-04-30",
  "pdf_url": "https://drive.google.com/...",
  "source_email": "vendor@example.com",
  "email_subject": "فاتورة شهر أبريل",
  "raw_text": "نص الرسالة أو محتوى الفاتورة المستخرج",
  "needs_ai_analysis": true
}
```

### عندما `needs_ai_analysis: true`:
1. النظام يجلب محتوى PDF من Google Drive
2. يرسله لـ OpenAI GPT-4o لتحليل واستخراج البيانات
3. يعبّي الحقول تلقائياً في Airtable

---

## Airtable Schema

### جدول: Invoices (الفواتير)

| الحقل | النوع | الوصف |
|-------|-------|-------|
| invoice_number | Single line text | رقم الفاتورة |
| vendor_name | Single line text | اسم المورد/الجهة |
| amount | Currency | المبلغ |
| currency | Single select | العملة (SAR default) |
| invoice_date | Date | تاريخ الفاتورة |
| due_date | Date | تاريخ الاستحقاق |
| status | Single select | الحالة: جديدة / مدفوعة / ملغاة |
| pdf_url | URL | رابط PDF في Google Drive |
| payment_link | URL | رابط الدفع (لو الفاتورة رابط) |
| uploaded_by | Single line text | اسم الرافع (تلقائي من الحساب) |
| uploaded_at | Date | تاريخ الإضافة للنظام |
| paid_at | Date | تاريخ الدفع (لما تتحول لمدفوعة) |
| paid_by | Single line text | اسم الشخص اللي دفع |
| notes | Long text | ملاحظات |
| source | Single select | المصدر: إيميل / يدوي |
| month_year | Single line text | الشهر-السنة (2026-04) للفلترة |
| cancelled_at | Date | تاريخ الإلغاء (اختياري - لحقول الإلغاء) |
| cancelled_by | Single line text | من ألغى الفاتورة (اختياري - لحقول الإلغاء) |

**ملاحظة:** حقول `cancelled_at` و `cancelled_by` **غير مفعّلة حالياً** في الكود (معلّقة) لأنها غير موجودة في Airtable بعد. لتفعيلها:
1. أضف الحقلين في جدول Invoices على Airtable
2. فك التعليق من السطور 92-95 في `src/app/api/invoices/[id]/route.ts`

### جدول: Users (المستخدمين)

| الحقل | النوع | الوصف |
|-------|-------|-------|
| username | Single line text | اسم المستخدم |
| display_name | Single line text | الاسم المعروض |
| password_hash | Single line text | هاش كلمة السر (bcrypt) |
| password | Single line text | كلمة السر بنص عادي (للأدمن فقط - **غير آمن**) |
| role | Single select | الدور: admin / viewer / team |
| is_active | Checkbox | فعال/معطل |
| created_at | Date | تاريخ الإنشاء |

**⚠️ ملاحظة أمنية:** تخزين كلمات السر بنص عادي في حقل `password` **ليس آمناً**، لكن تم تطبيقه بناءً على طلب العميل لنظام داخلي فقط. في أنظمة production حقيقية، استخدم فقط `password_hash`.

---

## ميزات إضافية تم تطويرها

### 1. حالة "ملغاة" للفواتير
- ✅ إضافة حالة ثالثة: جديدة / مدفوعة / **ملغاة**
- ✅ زر "إلغاء الفاتورة" مع confirmation dialog
- ✅ عرض الفواتير الملغاة في صفحة الأرشيف
- ⚠️ حقول cancelled_at و cancelled_by معلّقة (تحتاج إضافة في Airtable)

### 2. تحسينات صفحة الأرشيف
- ✅ عمود "الحالة" كأول عمود - Badge أخضر (مدفوعة) / أحمر (ملغاة)
- ✅ عمود "الإجراءات" كآخر عمود - زر "إرجاع إلى جديدة"
- ✅ نظام تأكيد بخطوتين (double-click confirmation)
- ✅ فلترة حسب الحالة: الكل / مدفوعة / ملغاة
- ✅ فلترة حسب الشهر (آخر 12 شهر)
- ✅ بحث نصي (vendor name أو invoice number)

### 3. تقييد صلاحيات فريق العمل
- ✅ فريق العمل يدخل مباشرة لـ `/add` فقط
- ✅ عند محاولة الوصول لصفحات أخرى → redirect لـ `/add`
- ✅ إخفاء Sidebar / Header / MobileNav عن فريق العمل
- ✅ زر تسجيل خروج خاص بـ team في صفحة `/add`
- ✅ منع GET لـ `/api/invoices` (فقط POST مسموح)

### 4. تحسينات Dashboard
- ✅ عرض بيانات حقيقية من Airtable (بدلاً من mock data)
- ✅ حساب الإحصائيات ديناميكياً:
  - عدد الفواتير الجديدة
  - إجمالي المعلق (sum of new invoices)
  - إجمالي المدفوع (sum of paid invoices)
- ✅ عرض آخر 4 فواتير جديدة في Dashboard
- ✅ Activity Log - آخر 5 أنشطة

### 5. تحسينات InvoiceCard
- ✅ تاقات (Badges): 📧 Airtable أو 👤 اسم المستخدم
- ✅ تاق "فاتورة جديدة" بلون أحمر للفواتير الجديدة
- ✅ نظام توسيع/تصغير البطاقة (expand/collapse)
- ✅ عرض ملاحظات + معاينة PDF عند التوسيع
- ✅ زر "تواصل مع المزود" (معطّل - جاهز للربط بإيميل لاحقاً)

### 6. إدارة المستخدمين
- ✅ صفحة كاملة لإدارة المستخدمين (أدمن فقط)
- ✅ عرض كلمات السر بنص عادي (plain text) للأدمن
- ✅ تعديل كلمة السر من واجهة المستخدمين
- ✅ تعطيل/تفعيل حسابات
- ✅ الحد الأدنى لكلمة السر: 6 أحرف (بدلاً من 8)

### 7. إصلاحات تقنية
- ✅ التراجع من Tailwind 4 إلى 3.4.17 (حل مشكلة Turbopack panic)
- ✅ إصلاح middleware matcher (من route groups إلى مسارات فعلية)
- ✅ توحيد الأرقام والتواريخ (en-US بدلاً من ar-SA)
- ✅ إصلاح type errors في TypeScript
- ✅ تنظيف console.log statements
- ✅ إضافة `/login` لـ publicPaths

---

## الحالة الحالية للمشروع

### المرحلة 1: ✅ مكتملة 95%
- ✅ المصادقة والصلاحيات
- ✅ Dashboard كامل مع إحصائيات حقيقية
- ✅ صفحة الفواتير الجديدة
- ✅ صفحة الأرشيف مع فلاتر
- ✅ إدارة المستخدمين
- ✅ تصميم responsive (ويب + جوال)

### المرحلة 2: 🔄 لم تبدأ
- [ ] رفع PDF لـ Google Drive
- [ ] تحليل AI للفواتير (GPT-4o)
- [ ] Webhook من Make.com
- [ ] عارض PDF داخلي

### ما يحتاج اختبار:
1. تسجيل الدخول (admin / viewer / team)
2. إضافة فاتورة يدوياً
3. تعديل حالة فاتورة (مدفوعة / ملغاة)
4. إرجاع فاتورة من الأرشيف لجديدة
5. فلترة وبحث في الأرشيف
6. صلاحيات فريق العمل
7. إدارة مستخدمين

