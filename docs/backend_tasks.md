# backend_tasks.md — مهام Backend Agent

> آخر تحديث: 2026-04-04

---

## نظام الرموز

```
- [ ]  ← لم يبدأ
- [~]  ← قيد التنفيذ
- [x]  ← مكتمل
- ⏳   ← ينتظر مهمة من UI Agent
- ⚡   ← بعد إكماله يفتح مهمة لـ UI Agent
- ✅   ← الاعتمادية مكتملة
- ❌   ← الاعتمادية لم تكتمل بعد
```

---

## المرحلة 1: الأساس — 2 أسابيع

### الأسبوع 1: البنية التحتية والمصادقة

#### 1.1a — إعداد Airtable client + types + env vars
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: لا يوجد ✅
- **الملفات المطلوبة**:
  - `src/lib/airtable.ts` — Airtable REST API client
  - `src/types/invoice.ts` — Invoice types
  - `src/types/user.ts` — User types
  - `src/types/api.ts` — API response types
  - `.env.example` — متغيرات البيئة المطلوبة
- **المتطلبات**:
  - تعريف functions لـ: list, get, create, update, delete
  - استخدام fetch API مباشرة (بدون SDK)
  - Error handling موحد
  - TypeScript types صارمة
- **يفتح بعد الإكمال**: 1.2a ⚡

---

#### 1.2a — نظام المصادقة (JWT) — login + middleware + role check
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 1.1a ✅
- **الملفات المطلوبة**:
  - `src/lib/auth.ts` — JWT utilities (sign, verify, hash password, compare)
  - `src/app/api/auth/login/route.ts` — POST endpoint للـ login
  - `middleware.ts` — حماية routes حسب الصلاحيات
- **المتطلبات**:
  - استخدام `jose` لـ JWT
  - استخدام `bcryptjs` لهاش كلمات السر
  - الـ JWT يحتوي: userId, username, role
  - Middleware يحمي routes: `/api/*` (ما عدا `/api/auth/login`)
  - role check: admin, viewer, team
- **يفتح بعد الإكمال**: 1.3a + 1.2b (UI) ⚡

---

#### 1.3a — API إدارة المستخدمين (CRUD) — أدمن فقط
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 1.2a ✅
- **الملفات المطلوبة**:
  - `src/app/api/users/route.ts` — GET (list all), POST (create user)
  - `src/app/api/users/[id]/route.ts` — GET (single), PATCH (update), DELETE (disable)
- **المتطلبات**:
  - فقط admin يقدر يوصل
  - GET: يرجع كل المستخدمين (بدون password_hash)
  - POST: ياخذ username, display_name, password, role → يعمل hash للـ password
  - PATCH: تعديل display_name, role, is_active (لا يعدّل password هنا)
  - DELETE: يعطّل المستخدم (is_active = false) — لا حذف فعلي
- **يفتح بعد الإكمال**: 2.5b (UI) ⚡

---

### الأسبوع 2: الواجهة الأساسية

#### 1.5a — API الفواتير — GET (list + filter) + GET single
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 1.2a ✅
- **الملفات المطلوبة**:
  - `src/app/api/invoices/route.ts` — GET
  - `src/app/api/invoices/[id]/route.ts` — GET
- **المتطلبات**:
  - GET list: يدعم query params:
    - `status`: "جديدة" | "مدفوعة"
    - `month_year`: "2026-04"
    - `limit`, `offset` (pagination)
  - GET single: يرجع فاتورة واحدة بكل تفاصيلها
  - الكل يقدر يوصل (admin, viewer, team) — الصلاحيات على level التعديل فقط
  - ترتيب: الأحدث أولاً (حسب invoice_date DESC)
- **يفتح بعد الإكمال**: 1.5b, 1.6b, 1.7b (UI) ⚡

---

#### 1.8a — API تحديث حالة الفاتورة (PATCH)
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 1.5a ✅
- **الملفات المطلوبة**:
  - `src/app/api/invoices/[id]/route.ts` — PATCH
- **المتطلبات**:
  - فقط admin و viewer يقدرون يحدّثون الحالة
  - PATCH body: `{ status: "مدفوعة" }`
  - عند التحديث لـ "مدفوعة":
    - حفظ `paid_at`: التاريخ الحالي
    - حفظ `paid_by`: اسم المستخدم من JWT
  - Error handling: لو الفاتورة ما موجودة → 404
- **يفتح بعد الإكمال**: 1.8b (UI) ⚡

---

## المرحلة 2: الإضافة والتكاملات — 2 أسابيع

### الأسبوع 3: إضافة الفواتير يدوياً + AI

#### 2.1a — API رفع PDF → Google Drive
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 1.8a ✅
- **الملفات المطلوبة**:
  - `src/lib/google-drive.ts` — Google Drive API client
  - `src/app/api/upload/route.ts` — POST
- **المتطلبات**:
  - استخدام Google Drive API v3
  - Service account authentication
  - POST endpoint ياخذ `multipart/form-data` (ملف PDF)
  - يرفع الملف لـ Drive folder محدد
  - يرجع: `{ url: "https://drive.google.com/...", fileId: "..." }`
  - حد أقصى: 10MB للملف
- **يفتح بعد الإكمال**: 2.1b (UI) ⚡

---

#### 2.2a — API تحليل الفاتورة بالـ AI (GPT-4o)
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 2.1a ✅
- **الملفات المطلوبة**:
  - `src/lib/openai.ts` — OpenAI client wrapper
  - `src/app/api/ai/analyze/route.ts` — POST
- **المتطلبات**:
  - استخدام OpenAI API — model: `gpt-4o`
  - POST body: `{ text: "محتوى الفاتورة..." }` أو `{ pdfUrl: "..." }`
  - الـ AI يستخرج:
    - invoice_number
    - vendor_name
    - amount
    - currency
    - invoice_date
    - due_date
  - Response: `{ extracted: { ... }, confidence: "high" | "medium" | "low" }`
  - Error handling: لو AI فشل → يرجع حقول فارغة + رسالة
- **يفتح بعد الإكمال**: 2.2b (UI) ⚡

---

#### 2.3a — API إنشاء فاتورة جديدة (POST)
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 2.2a ✅
- **الملفات المطلوبة**:
  - `src/app/api/invoices/route.ts` — POST
  - `src/lib/validations.ts` — Zod schema للـ invoice creation
- **المتطلبات**:
  - POST body:
    ```json
    {
      "invoice_number": "INV-001",
      "vendor_name": "شركة المثال",
      "amount": 5000,
      "currency": "SAR",
      "invoice_date": "2026-04-01",
      "due_date": "2026-04-30",
      "pdf_url": "https://...",
      "payment_link": "https://...", // optional
      "notes": "ملاحظات", // optional
      "source": "يدوي"
    }
    ```
  - Validation بـ Zod
  - يحفظ في Airtable مع:
    - `uploaded_by`: من JWT
    - `uploaded_at`: التاريخ الحالي
    - `status`: "جديدة"
    - `month_year`: مستخرج من invoice_date
  - الكل يقدر يضيف (admin, viewer, team)
- **يفتح بعد الإكمال**: 2.3b (UI) ⚡

---

### الأسبوع 4: Webhook + إدارة المستخدمين

#### 2.4a — Webhook endpoint لـ Make.com
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 2.3a ✅
- **الملفات المطلوبة**:
  - `src/app/api/webhook/make/route.ts` — POST
- **المتطلبات**:
  - Public endpoint (لا يحتاج JWT)
  - التحقق من Make.com webhook secret (عبر header أو signature)
  - POST body (حسب `CLAUDE.md`):
    ```json
    {
      "invoice_number": "...",
      "vendor_name": "...",
      "amount": 5000,
      "currency": "SAR",
      "invoice_date": "...",
      "due_date": "...",
      "pdf_url": "...",
      "source_email": "...",
      "email_subject": "...",
      "raw_text": "...",
      "needs_ai_analysis": true
    }
    ```
  - لو `needs_ai_analysis: true`:
    1. يستدعي `/api/ai/analyze`
    2. يدمج النتائج
    3. يحفظ في Airtable
  - لو `false`: يحفظ مباشرة
  - Response: `{ success: true, invoiceId: "..." }`
- **يفتح بعد الإكمال**: لا يوجد (خدمة خلفية)

---

## المرحلة 3: التلميع والنشر — 1 أسبوع

#### 3.1 — اختبار شامل لكل التدفقات (Backend)
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: كل المرحلة 2 ✅
- **الملفات المُنشأة**:
  - `API_DOCUMENTATION.md` — توثيق شامل لجميع الـ API endpoints
- **الملاحظات**:
  - تم فحص جميع الملفات وال endpoints
  - تم التأكد من جودة الكود وعدم وجود أخطاء
  - تم إنشاء توثيق شامل بالعربية

#### 3.2 — إصلاح الأخطاء (Backend)
- [x] **الحالة**: مكتمل ✅
- **الاعتماديات**: 3.1 ✅
- **الإصلاحات**:
  - إصلاح خطأ تكرار `MAKE_WEBHOOK_SECRET=` في `.env.example`
  - تحديث تنسيق `GOOGLE_DRIVE_CREDENTIALS` ليكون JSON string كامل
  - توحيد تنسيق متغيرات البيئة

#### 3.4 — تحسين الأداء (Backend)
- [ ] **الحالة**: لم يبدأ
- **الاعتماديات**: 3.2 ❌

#### 3.5 — النشر على Vercel
- [ ] **الحالة**: لم يبدأ
- **الاعتماديات**: 3.4 ❌

#### 3.6 — اختبار حقيقي
- [ ] **الحالة**: لم يبدأ
- **الاعتماديات**: 3.5 ❌

---

## ملاحظات

### قواعد التنفيذ
- ✅ لا تنفّذ أكثر من 3 مهام في جلسة واحدة
- ✅ تحقق من الاعتماديات قبل البدء
- ✅ سجّل كل إنجاز في `backend_logs.md`
- ✅ حدّث الحالة والرموز باستمرار
- ✅ أبلغ مدير المشروع بعد كل 3 مهام

### الأولويات
1. الترتيب التسلسلي (1.1a قبل 1.2a قبل 1.3a...)
2. لا تقفز بين المراحل
3. احترم رمز ⚡ — بعد الإكمال أبلغ UI Agent
