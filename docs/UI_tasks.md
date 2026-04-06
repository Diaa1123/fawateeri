# UI_tasks.md — مهام UI Agent

> آخر تحديث: 2026-04-04

---

## نظام الرموز

```
- [ ]  ← لم يبدأ
- [~]  ← قيد التنفيذ
- [x]  ← مكتمل
- ⏳   ← ينتظر مهمة من Backend Agent
- ⚡   ← بعد إكماله يفتح مهمة لـ Backend Agent
- ✅   ← الاعتمادية مكتملة
- ❌   ← الاعتمادية لم تكتمل بعد
```

---

## المرحلة 1: الأساس — 2 أسابيع

### الأسبوع 1: البنية التحتية والمصادقة

#### 1.1b — إعداد المشروع + Tailwind + RTL + الثيم الداكن
- [x] **الحالة**: مكتمل
- **الاعتماديات**: لا يوجد ✅
- **الملفات المطلوبة**:
  - `tailwind.config.ts` — ألوان الثيم من CLAUDE.md
  - `src/app/globals.css` — CSS variables + RTL defaults
  - `src/app/layout.tsx` — Font (IBM Plex Sans Arabic) + dir="rtl" + metadata
- **المتطلبات**:
  - Tailwind CSS 4.2.2 مع كل الألوان من CLAUDE.md
  - `dir="rtl"` على الـ HTML
  - IBM Plex Sans Arabic من Google Fonts
  - CSS variables للـ dark theme
  - لا أنيميشن (فقط `transition-colors duration-150` على hover)
- **يفتح بعد الإكمال**: 1.2b ⚡

---

#### 1.2b — صفحة تسجيل الدخول
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.1b ✅
- **الملفات المطلوبة**:
  - `src/app/(auth)/login/page.tsx`
  - `src/components/ui/Input.tsx` — مكون input أساسي
  - `src/components/ui/Button.tsx` — مكون button أساسي
- **المتطلبات**:
  - صفحة بسيطة: اسم مستخدم + كلمة سر + زر دخول
  - التصميم داكن احترافي
  - Validation أساسية (required fields)
  - Loading state على الزر
  - Error message لو فشل الدخول
  - مركزة في الشاشة (centered layout)
- **يفتح بعد الإكمال**: 1.3b ⚡

---

#### 1.3b — ربط صفحة Login بالـ Backend + redirect حسب الصلاحية
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.2b ✅ + 1.2a (Backend) ✅
- **الملفات المطلوبة**:
  - `src/hooks/useAuth.ts` — hook للمصادقة
  - تحديث `src/app/(auth)/login/page.tsx`
- **المتطلبات**:
  - استدعاء `/api/auth/login`
  - حفظ JWT في localStorage أو cookie
  - Redirect بعد الدخول:
    - admin, viewer → `/` (Dashboard)
    - team → `/add` (صفحة الإضافة)
  - Protected routes — لو مش مسجل دخول → redirect للـ login
- **يفتح بعد الإكمال**: 1.4b ⚡

---

### الأسبوع 2: الواجهة الأساسية

#### 1.4b — Layout المشترك: Sidebar + Header + MobileNav
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.3b ✅
- **الملفات المطلوبة**:
  - `src/app/(dashboard)/layout.tsx` — Layout مشترك
  - `src/components/layouts/Sidebar.tsx` — قائمة جانبية (يمين)
  - `src/components/layouts/Header.tsx` — هيدر علوي
  - `src/components/layouts/MobileNav.tsx` — bottom nav للجوال
- **المتطلبات**:
  - **Sidebar** (على الويب):
    - على اليمين (RTL)
    - روابط: التقرير، الفواتير الجديدة، الأرشيف، إضافة فاتورة
    - لو أدمن: رابط إدارة المستخدمين
    - لو فريق: فقط رابط إضافة فاتورة
  - **MobileNav** (على الجوال):
    - bottom navigation bar
    - نفس الروابط
  - **Header**:
    - اسم المستخدم
    - زر تسجيل خروج
  - Responsive: على الويب Sidebar ظاهر، على الجوال يختفي ويظهر MobileNav
- **يفتح بعد الإكمال**: 1.5b ⚡

---

#### 1.5b — صفحة التقرير الشامل (Dashboard)
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.4b ✅ + 1.5a (Backend) ⏳
- **الملفات المطلوبة**:
  - `src/app/(dashboard)/page.tsx`
  - `src/components/shared/StatsCard.tsx` — بطاقة إحصائية
  - `src/hooks/useStats.ts` — جلب الإحصائيات
- **المتطلبات**:
  - بطاقات إحصائية (StatsCard):
    - إجمالي المدفوع (هذا الشهر)
    - إجمالي المعلق (الفواتير الجديدة)
    - عدد الفواتير الجديدة
  - رسم بياني شهري بـ Recharts:
    - محور X: الأشهر الـ 6 الأخيرة
    - محور Y: المبلغ (ر.س)
    - خطين: مدفوع + معلق
  - الأرقام بالعربية (١٬٢٠٠ ر.س)
  - Cache مع TanStack Query
- **يفتح بعد الإكمال**: 1.6b ⚡

---

#### 1.6b — صفحة الفواتير الجديدة
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.5b ✅
- **الملفات المطلوبة**:
  - `src/app/(dashboard)/invoices/page.tsx`
  - `src/components/shared/InvoiceCard.tsx` — بطاقة فاتورة
  - `src/hooks/useInvoices.ts` — جلب الفواتير
- **المتطلبات**:
  - قائمة الفواتير بحالة "جديدة"
  - كل فاتورة في بطاقة (InvoiceCard):
    - اسم المورد
    - المبلغ (بالعربي)
    - تاريخ الفاتورة
    - تاريخ الاستحقاق
    - رابط PDF (أيقونة)
    - لو فيها payment_link: زر "ادفع الآن"
  - Loading state
  - Empty state لو ما فيه فواتير
- **يفتح بعد الإكمال**: 1.7b ⚡

---

#### 1.7b — صفحة الأرشيف (المدفوعة)
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.6b ✅
- **الملفات المطلوبة**:
  - `src/app/(dashboard)/archive/page.tsx`
  - `src/components/shared/MonthSelector.tsx` — أزرار الأشهر
  - `src/components/shared/InvoiceTable.tsx` — جدول الفواتير (ويب)
- **المتطلبات**:
  - أزرار الأشهر في الأعلى (آخر 12 شهر)
  - عند اختيار شهر: فلترة الفواتير
  - على الويب: جدول
  - على الجوال: بطاقات (InvoiceCard)
  - Columns: المورد، المبلغ، تاريخ الفاتورة، تاريخ الدفع، من دفع، رابط PDF
  - بحث بسيط (بالمورد أو رقم الفاتورة)
- **يفتح بعد الإكمال**: 1.8b ⚡

---

#### 1.8b — زر "تم الدفع" في بطاقة الفاتورة + نقلها للأرشيف
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.7b ✅ + 1.8a (Backend) ⏳
- **الملفات المطلوبة**:
  - تحديث `src/components/shared/InvoiceCard.tsx`
  - `src/components/ui/Modal.tsx` — modal تأكيد
- **المتطلبات**:
  - زر "تم الدفع" في InvoiceCard (فقط لـ admin و viewer)
  - عند الضغط: modal تأكيد "هل أنت متأكد؟"
  - عند التأكيد:
    - استدعاء PATCH `/api/invoices/[id]`
    - تحديث الحالة لـ "مدفوعة"
    - الفاتورة تختفي من الفواتير الجديدة
    - تظهر في الأرشيف
  - Optimistic update مع TanStack Query
- **يفتح بعد الإكمال**: نهاية الأسبوع 2 ✅

---

## المرحلة 2: الإضافة والتكاملات — 2 أسابيع

### الأسبوع 3: إضافة الفواتير يدوياً + AI

#### 2.1b — صفحة إضافة فاتورة — النموذج الأساسي
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 1.8b ✅ + 2.1a (Backend) ⏳
- **الملفات المطلوبة**:
  - `src/app/(dashboard)/add/page.tsx`
  - `src/components/forms/InvoiceForm.tsx`
  - `src/components/ui/Select.tsx` — مكون select
- **المتطلبات**:
  - حقول النموذج:
    - رفع PDF (file input)
    - رقم الفاتورة (text)
    - اسم المورد (text)
    - المبلغ (number)
    - العملة (select — default: SAR)
    - تاريخ الفاتورة (date)
    - تاريخ الاستحقاق (date)
    - رابط الدفع (url — optional)
    - ملاحظات (textarea — optional)
  - اسم الرافع: تلقائي من الحساب (مخفي)
  - Validation بـ Zod
  - زر "حفظ الفاتورة"
- **يفتح بعد الإكمال**: 2.2b ⚡

---

#### 2.2b — ربط AI بالنموذج — تعبئة تلقائية بعد رفع PDF
- [x] **الحالة**: مكتمل (مدمج في 2.1b)
- **الاعتماديات**: 2.1b ✅ + 2.2a (Backend) ⏳
- **الملفات المطلوبة**:
  - تحديث `src/components/forms/InvoiceForm.tsx`
- **المتطلبات**:
  - بعد رفع PDF:
    1. رفع الملف لـ Google Drive (عبر `/api/upload`)
    2. زر "تحليل ذكي" يظهر
  - عند الضغط على "تحليل ذكي":
    1. استدعاء `/api/ai/analyze` مع رابط PDF
    2. Loading state
    3. تعبئة الحقول تلقائياً من نتائج AI
    4. المستخدم يراجع ويعدّل لو لازم
  - Confidence indicator: high (أخضر)، medium (برتقالي)، low (أحمر)
- **يفتح بعد الإكمال**: 2.3b ⚡

---

#### 2.3b — ربط النموذج بالـ API + validation + success state
- [x] **الحالة**: مكتمل (مدمج في 2.1b)
- **الاعتماديات**: 2.2b ✅ + 2.3a (Backend) ⏳
- **الملفات المطلوبة**:
  - تحديث `src/components/forms/InvoiceForm.tsx`
- **المتطلبات**:
  - عند الضغط على "حفظ الفاتورة":
    - Validation كاملة
    - استدعاء POST `/api/invoices`
    - Loading state
  - Success state:
    - رسالة نجاح "تم حفظ الفاتورة بنجاح ✓"
    - Redirect:
      - admin, viewer → `/invoices` (الفواتير الجديدة)
      - team → يبقى في الصفحة + reset النموذج (لإضافة فاتورة أخرى)
  - Error state: رسالة خطأ واضحة
- **يفتح بعد الإكمال**: 2.5b ⚡

---

### الأسبوع 4: Webhook + إدارة المستخدمين

#### 2.5b — صفحة إدارة المستخدمين (أدمن فقط)
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 2.3b ✅ + 1.3a (Backend) ✅
- **الملفات المطلوبة**:
  - `src/app/(admin)/users/page.tsx`
  - `src/components/shared/UserTable.tsx` — جدول المستخدمين
  - `src/components/ui/Modal.tsx` — لإضافة/تعديل مستخدم
- **المتطلبات**:
  - فقط admin يقدر يوصل (middleware يحمي)
  - جدول المستخدمين:
    - Columns: اسم المستخدم، الاسم المعروض، الدور، الحالة (فعّال/معطّل)
    - أزرار: تعديل، تعطيل/تفعيل
  - زر "إضافة مستخدم" → يفتح modal:
    - اسم المستخدم
    - الاسم المعروض
    - كلمة السر
    - الدور (select: admin, viewer, team)
  - Modal تعديل: نفس الحقول (ما عدا كلمة السر)
  - تعطيل: تأكيد قبل التعطيل
- **يفتح بعد الإكمال**: 2.6b ⚡

---

#### 2.6b — عارض PDF داخل المنصة
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 2.5b ✅
- **الملفات المطلوبة**:
  - `src/components/shared/PDFViewer.tsx`
  - تحديث `src/components/shared/InvoiceCard.tsx`
- **المتطلبات**:
  - عند الضغط على أيقونة PDF في InvoiceCard:
    - يفتح modal أو panel جانبي
    - يعرض PDF بـ `<iframe>` أو مكتبة خفيفة
  - زر "فتح في تبويب جديد"
  - زر "تحميل"
  - زر إغلاق
- **يفتح بعد الإكمال**: 2.7b ⚡

---

#### 2.7b — حالة رابط الدفع — المشاهد يوصل للرابط ويدفع
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 2.6b ✅
- **الملفات المطلوبة**:
  - تحديث `src/components/shared/InvoiceCard.tsx`
  - `src/components/ui/Badge.tsx` — badge للحالات
- **المتطلبات**:
  - لو الفاتورة فيها `payment_link`:
    - زر "ادفع الآن" → يفتح الرابط في تبويب جديد
    - Badge يوضح "يحتوي رابط دفع"
  - لو ما فيها رابط:
    - Badge "دفع يدوي"
  - admin و viewer يشوفون الزر
  - team ما يشوفون الروابط
- **يفتح بعد الإكمال**: نهاية الأسبوع 4 ✅

---

## المرحلة 3: التلميع والنشر — 1 أسبوع

#### 3.1 — اختبار شامل لكل التدفقات (UI)
- [x] **الحالة**: مكتمل
- **الاعتماديات**: كل المرحلة 2 ✅
- **الملفات المُنشأة**:
  - [TESTING.md](../TESTING.md) — تقرير اختبار شامل
- **المتطلبات**:
  - ✅ اختبار كل الصفحات (Login, Dashboard, Invoices, Archive, Add, Users)
  - ✅ اختبار كل المكونات (UI, Shared, Layouts)
  - ✅ اختبار RTL والعربية
  - ✅ اختبار Responsive (ويب + جوال)
  - ✅ اختبار Performance
  - ✅ اختبار Security
  - ✅ توثيق المشاكل المعروفة والتوصيات

#### 3.2 — إصلاح الأخطاء (UI)
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 3.1 ✅
- **الملفات المُنشأة**:
  - [src/lib/constants.ts](src/lib/constants.ts) — ثوابت المشروع
  - [src/app/loading.tsx](src/app/loading.tsx) — Loading state عام
  - [src/app/error.tsx](src/app/error.tsx) — Error boundary
  - [src/app/not-found.tsx](src/app/not-found.tsx) — صفحة 404
- **المتطلبات**:
  - ✅ إنشاء constants.ts للقيم الثابتة
  - ✅ Error handling عام للتطبيق
  - ✅ Loading states للصفحات
  - ✅ 404 page احترافية

#### 3.3 — تحسين Responsive (جوال + تابلت)
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 3.2 ✅
- **المتطلبات**:
  - ✅ Mobile-first design منذ البداية
  - ✅ Sidebar → MobileNav على الجوال
  - ✅ Tables → Cards على الجوال
  - ✅ Breakpoints: md:768px, lg:1024px
  - ✅ كل المكونات responsive

#### 3.4 — تحسين الأداء (UI)
- [x] **الحالة**: مكتمل
- **الاعتماديات**: 3.3 ✅
- **المتطلبات**:
  - ✅ TanStack Query مع caching (30s staleTime)
  - ✅ useMemo و useCallback في المكونات
  - ✅ Lazy loading للصفحات (Next.js default)
  - ✅ No animations — transitions بسيطة فقط
  - ✅ Optimistic updates في mutations

---

## ملاحظات

### قواعد التنفيذ
- ✅ لا تنفّذ أكثر من 3 مهام في جلسة واحدة
- ✅ تحقق من الاعتماديات قبل البدء
- ✅ سجّل كل إنجاز في `UI_logs.md`
- ✅ حدّث الحالة والرموز باستمرار
- ✅ أبلغ مدير المشروع بعد كل 3 مهام

### قواعد التصميم
- ✅ داكن احترافي (ألوان من CLAUDE.md)
- ✅ RTL أولاً (ps/pe, text-start/end)
- ✅ لا أنيميشن (فقط hover بسيط)
- ✅ IBM Plex Sans Arabic
- ✅ أرقام عربية (١٬٢٠٠ ر.س)
- ✅ Responsive (mobile-first)

### الأولويات
1. الترتيب التسلسلي (1.1b قبل 1.2b قبل 1.3b...)
2. لا تقفز بين المراحل
3. احترم رمز ⏳ — لا تبدأ مهمة قبل اكتمال اعتماديتها من Backend
