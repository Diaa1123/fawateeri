# قرارات المشروع — Fawateeri

هذا الملف يوثّق القرارات الجذرية التي تؤثر على بنية المشروع أو سلوكه.

---

## 2026-04-05: تحويل التواريخ والأرقام للإنجليزي

### القرار:
جميع التواريخ والأرقام المالية تُعرض بالإنجليزي (en-US) بدلاً من العربي (ar-SA).

### السبب:
- سهولة القراءة والتعامل مع الأرقام
- توافق أفضل مع الأنظمة الخارجية (Make.com، APIs)
- الأرقام العربية (١٬٢٠٠) أصعب في القراءة السريعة للأرقام الكبيرة

### التأثير:
- **التواريخ:** من "٥ أبريل ٢٠٢٦" → "April 5, 2026"
- **الأرقام المالية:** من "١٬٢٠٠٫٠٠ ر.س" → "1,200.00 SAR"
- **الأشهر:** من "أبريل" → "April"

### ما لم يتغير:
- المحتوى النصي لا يزال عربياً
- `lang="ar"` و `dir="rtl"` في layout

### الملفات المتأثرة:
- `src/lib/utils.ts` — جميع دوال التنسيق
- جميع المكونات التي تعرض تواريخ أو أرقام

---

## 2026-04-05: إضافة حالة "ملغاة" للفواتير

### القرار:
إضافة حالة ثالثة للفواتير: "ملغاة" (بالإضافة لـ "جديدة" و "مدفوعة").

### السبب:
- الحاجة لتتبع الفواتير الملغاة بشكل منفصل
- الفواتير الملغاة تحتاج معاملة مختلفة عن المدفوعة في التقارير

### التأثير:
- **Types:** `InvoiceStatus = "جديدة" | "مدفوعة" | "ملغاة"`
- **حقول جديدة:** `cancelled_at`, `cancelled_by`
- **API:** PATCH `/api/invoices/[id]` يقبل الحالة الجديدة
- **Airtable:** يحتاج تحديث schema يدوياً

### مسار الفاتورة:
```
فاتورة جديدة (new)
  ↓
[تم الدفع] → مدفوعة (paid) → الأرشيف
  أو
[إلغاء] → ملغاة (cancelled) → الأرشيف
```

### الملفات المتأثرة:
- `src/types/invoice.ts`
- `src/lib/constants.ts`
- `src/app/api/invoices/[id]/route.ts`

---

## القرارات السابقة (موثقة في CLAUDE.md):

### استخدام Airtable كقاعدة بيانات
- **لماذا:** بسيط، سريع، يدعم API، لا يحتاج إعداد server
- **ضد:** PostgreSQL / Supabase / Prisma (معقدة للمشروع البسيط)

### عدم استخدام Animations
- **لماذا:** المشروع أداة داخلية، التركيز على الوظيفة لا الشكل
- **ضد:** framer-motion، animations معقدة

### تخزين كلمات السر بنص عادي
- **لماذا:** طلب صريح من العميل - نظام داخلي
- **تحذير:** ❌ **غير آمن** - لا تستخدم هذا في أنظمة عامة
- **التطبيق:** حقل `password` بجانب `password_hash`

### RTL أولاً
- **لماذا:** المستخدمون عرب، الواجهة عربية
- **التطبيق:** `ps/pe/ms/me` بدل `pl/pr/ml/mr`

### عدم استخدام npm run build أثناء التطوير
- **لماذا:** build بطيء، dev server يكفي للتطوير
- **التطبيق:** فقط `npm run dev` - البناء النهائي عند النشر فقط

---

## 2026-04-07: معمارية الجدولين (Dual Table Architecture)

### القرار:
فصل الفواتير في جدولين منفصلين في Airtable حسب مصدر البيانات:

**1. جدول Invoices** (`AIRTABLE_INVOICES_TABLE`):
- المصدر: فواتير أوتوماتيكية من الإيميل عبر Make.com webhook
- التاق: 📧 Airtable
- الاستخدام: webhook يحفظ مباشرة في هذا الجدول

**2. جدول Vendors** (`AIRTABLE_VENDORS_TABLE_ID = tblwwO3URoTCSJ8Qg`):
- المصدر: فواتير مضافة يدوياً من داخل النظام (صفحة /add)
- التاق: 👤 [اسم المستخدم الذي أضافها]
- الاستخدام: فريق العمل يضيف فواتير عبر الواجهة

### السبب:
1. **فصل مصادر البيانات:** كل جدول له مصدر محدد واضح
2. **مرونة في الإدارة:** يمكن إدارة كل نوع بشكل مختلف (schema، permissions، validation)
3. **Scalability:** سهولة إضافة جداول جديدة لمصادر أخرى مستقبلاً
4. **Schema Differences:** جدول Vendors يحتوي على حقول إضافية (email، invoice_file، currency_preference)

### التأثير على الكود:

#### 1. **Types** (`src/types/invoice.ts`):
```typescript
export type InvoiceTableSource = "invoices" | "vendors";

export interface Invoice {
  // حقول جديدة
  invoice_file?: string;        // من جدول Vendors - Airtable attachment
  payment_URL?: string;         // بدلاً من payment_link
  email?: string;               // من جدول Vendors
  currency_preference?: string; // من جدول Vendors

  // حقول داخلية - لا تُرسل لـ Airtable
  _source?: InvoiceTableSource; // تحديد المصدر: 'invoices' | 'vendors'
  _tableId?: string;            // Table ID للاستخدام في PATCH
}
```

#### 2. **Airtable Client** (`src/lib/airtable.ts`):

**دوال منفصلة لكل جدول:**
```typescript
// Invoices table (إيميل/webhook)
getInvoices(filter?)           → Invoice[] with _source: 'invoices'
createInvoice(data)            → POST في Invoices table
updateInvoice(id, data)        → PATCH في Invoices table

// Vendors table (يدوي)
getVendorInvoices(filter?)     → Invoice[] with _source: 'vendors'
createVendorInvoice(data)      → POST في Vendors table
updateVendorInvoice(id, data)  → PATCH في Vendors table

// مدمج
getAllInvoices(filter?)        → يجلب من الجدولين + يدمج + يرتب بالتاريخ
```

**ميزة مهمة:** كل فاتورة تحمل `_source` و `_tableId` تلقائياً عند جلبها.

#### 3. **API Routes**:

**GET /api/invoices?all=true:**
```typescript
if (searchParams.get('all') === 'true') {
  return getAllInvoices(); // من الجدولين
} else {
  return getInvoices();    // Invoices table فقط (backward compatible)
}
```

**POST /api/invoices:**
```typescript
const { _source, ...data } = await req.json();

if (_source === 'vendors') {
  return createVendorInvoice(data); // حفظ في Vendors
} else {
  return createInvoice(data);       // حفظ في Invoices (webhook)
}
```

**PATCH /api/invoices/[id]:**
```typescript
const { status, _source } = await req.json();

if (_source === 'vendors') {
  return updateVendorInvoice(id, { status, paid_at, paid_by });
} else {
  return updateInvoice(id, { status, paid_at, paid_by });
}
```

#### 4. **Frontend Components**:

**InvoiceCard.tsx:**
- التاق يعتمد على `_source`: 📧 Airtable أو 👤 username
- زر "تواصل مع المزود" يظهر فقط إذا `_source === 'vendors'`
- زر PDF يختفي إذا `pdf_url` و `invoice_file` كلاهما فارغ
- دعم `payment_URL` بالإضافة لـ `payment_link`
- أزرار الدفع/الإلغاء ترسل `_source` في body الطلب

**صفحات العرض:**
- `/` (Dashboard), `/invoices`, `/archive` تستخدم `getAllInvoices()` لجلب من الجدولين
- `/add` تحفظ في Vendors table فقط

### معالجة invoice_number:
**القرار:** لا نرسل `invoice_number` عند POST/PATCH لأي من الجدولين.
**السبب:** الحقل قد يكون computed field في Airtable.
**التطبيق:** جميع دوال create/update تزيل `invoice_number` قبل الإرسال.

### Backward Compatibility:
- API routes تدعم الكود القديم الذي لا يرسل `_source`
- إذا `_source` غير موجود في PATCH، يستخدم `updateInvoice` (Invoices table) تلقائياً

### الملفات المتأثرة:
1. `.env.local` + `.env.example` - إضافة `AIRTABLE_VENDORS_TABLE_ID`
2. `src/types/invoice.ts` - إضافة `_source`, `_tableId`, حقول جديدة
3. `src/lib/airtable.ts` - 6 دوال جديدة + getAllInvoices
4. `src/app/api/invoices/[id]/route.ts` - دعم `_source` في PATCH
5. `src/components/shared/InvoiceCard.tsx` - إضافة `_source` في الطلبات + تحسينات UI

### TODO للمستقبل:
- [ ] إضافة `reverted_at` و `reverted_by` لتتبع الفواتير المُرجعة من مدفوعة/ملغاة لجديدة
- [ ] دعم مصادر بيانات إضافية (جداول أخرى) بنفس النمط

---

## 2026-04-07: صلاحيات فريق العمل المحدودة (Team Role Restrictions)

### القرار:
فريق العمل (role: 'team') لهم صلاحيات محدودة جداً - فقط صفحة إضافة الفواتير.

### السبب:
1. **الأمان:** منع فريق العمل من الوصول للتقارير أو بيانات الفواتير الأخرى
2. **التركيز:** يركزون فقط على إدخال البيانات
3. **البساطة:** واجهة بسيطة بدون تشتيت

### التطبيق:

#### 1. **Middleware** (`middleware.ts`):
```typescript
if (payload.role === 'team') {
  const allowedForTeam = pathname === '/add' || pathname.startsWith('/api/invoices');
  
  if (!allowedForTeam) {
    // Redirect pages to /add
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect('/add');
    }
    // Block API requests
    return NextResponse.json({ error: '...' }, { status: 403 });
  }
}
```

**النتيجة:**
- أي محاولة للوصول لـ `/`, `/invoices`, `/archive`, `/users` → redirect تلقائي لـ `/add`
- API requests محظورة ماعدا `/api/invoices` (POST فقط)

#### 2. **Login Page** (`src/app/(auth)/login/page.tsx`):
```typescript
if (result.user.role === 'team') {
  router.push('/add');     // فريق العمل → صفحة الإضافة
} else {
  router.push('/');        // admin/viewer → Dashboard
}
```

#### 3. **Dashboard Layout** (`src/app/(dashboard)/layout.tsx`):
```typescript
if (user?.role === 'team') {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Simple Header with Logout */}
      <div className="border-b border-border-default bg-bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1>فواتيري</h1>
            <p>مرحباً، {user.display_name}</p>
          </div>
          <button onClick={handleLogout}>تسجيل الخروج</button>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
```

**النتيجة:**
- لا Sidebar
- لا Header معقد
- فقط header بسيط بزر خروج
- الواجهة نظيفة ومركزة على المحتوى

### تجربة المستخدم:
1. فريق العمل يسجل دخول
2. يُوجّه مباشرة لصفحة `/add`
3. يملأ بيانات الفاتورة ويحفظ
4. تُحفظ الفاتورة في جدول Vendors مع `uploaded_by = username`
5. عند محاولة الوصول لأي صفحة أخرى → redirect تلقائي لـ `/add`
6. لو حاول الوصول لـ API آخر → 403 Forbidden

### الملفات المتأثرة:
1. `middleware.ts` - redirect logic لفريق العمل
2. `src/app/(auth)/login/page.tsx` - redirect بعد login حسب role
3. `src/app/(dashboard)/layout.tsx` - layout بسيط لفريق العمل

### TODO للمستقبل:
- [ ] إضافة صفحة "الفواتير الخاصة بي" لفريق العمل (يشوف فواتيره فقط)
- [ ] إضافة نظام notifications عند إضافة فاتورة

---
