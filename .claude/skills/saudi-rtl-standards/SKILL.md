---
name: saudi-rtl-standards
description: معايير التصميم والتطوير للمشاريع السعودية العربية. يُستخدم تلقائياً عند إنشاء أي واجهة مستخدم، مكون، صفحة، أو تصميم يستهدف السوق السعودي/الخليجي. يشمل RTL، الخطوط العربية، تنسيق العملة والتاريخ، ومعايير UX للمستخدم العربي.
---

# معايير المشاريع السعودية — Saudi RTL Standards

## متى تُستخدم هذه المهارة
- عند إنشاء أي واجهة مستخدم عربية
- عند التعامل مع نصوص، تواريخ، أو عملات سعودية
- عند بناء مكونات تستهدف المستخدم السعودي/الخليجي

## 1. اتجاه RTL

### القواعد الأساسية
```html
<html dir="rtl" lang="ar-SA">
```

### Tailwind CSS — استخدم Logical Properties دائماً
```
✅ ps-4, pe-4    (padding-start, padding-end)
❌ pl-4, pr-4    (padding-left, padding-right)

✅ ms-2, me-2    (margin-start, margin-end)
❌ ml-2, mr-2    (margin-left, margin-right)

✅ start-0, end-0
❌ left-0, right-0

✅ rounded-s-xl, rounded-e-xl
❌ rounded-l-xl, rounded-r-xl

✅ text-start, text-end
❌ text-left, text-right
```

### الأيقونات الاتجاهية
```tsx
// الأسهم و chevrons تنعكس في RTL
<ChevronRight className="rtl:rotate-180" />
<ArrowLeft className="rtl:rotate-180" />

// أيقونات غير اتجاهية لا تنعكس
// ✅ Search, Home, Settings, Heart — تبقى كما هي
```

### ترتيب العناصر
```tsx
// Flexbox يتعامل مع RTL تلقائياً
<div className="flex gap-3">
  {/* العناصر تترتب من اليمين لليسار تلقائياً */}
</div>

// Grid كذلك
<div className="grid grid-cols-3 gap-4">
  {/* الترتيب يبدأ من اليمين */}
</div>
```

## 2. الخطوط العربية

### الخط الأساسي المعتمد
```css
/* IBM Plex Sans Arabic — الخيار الافتراضي */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

:root {
  --font-primary: 'IBM Plex Sans Arabic', sans-serif;
}
```

### بدائل حسب طبيعة المشروع
```css
/* للمشاريع الرسمية/الحكومية */
--font-primary: 'Noto Kufi Arabic', sans-serif;

/* للمشاريع الإبداعية/الشبابية */
--font-primary: 'Tajawal', sans-serif;

/* للمشاريع الفاخرة */
--font-primary: 'Readex Pro', sans-serif;
```

### أحجام الخطوط
```css
/* العربي يحتاج حجم أكبر قليلاً من الإنجليزي للقراءة المريحة */
--text-xs: 13px;     /* الأصغر المسموح */
--text-sm: 14px;
--text-base: 16px;   /* الأساسي */
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;

/* ارتفاع السطر للعربي */
line-height: 1.8;    /* أعلى من الإنجليزي (1.5) */
```

## 3. تنسيق الأرقام والعملات

⚠️ **تحديث أبريل 2026:** تم تغيير معيار عرض الأرقام والتواريخ إلى الإنجليزية بناءً على قرار العميل.

### الأسعار — ريال سعودي
```typescript
const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price).replace('SAR', 'SAR'); // يعرض: 1,200.00 SAR

// النتيجة الجديدة: 120 SAR
// النتيجة الجديدة: 1,250.50 SAR
```

### الأرقام العامة
```typescript
const formatNumber = (num: number): string =>
  new Intl.NumberFormat("en-US").format(num);

// النتيجة: 1,500
```

### أرقام الهاتف السعودي
```typescript
// التنسيق المعتمد
const formatPhone = (phone: string): string => {
  // يبدأ بـ 05 محلياً أو +966 دولياً
  // العرض: 05X XXX XXXX
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("966")) {
    return `+966 ${clean.slice(3, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
};

// Validation
const saudiPhoneRegex = /^(05|9665)\d{8}$/;
```

## 4. التواريخ

### التنسيق الافتراضي
⚠️ **تحديث:** التواريخ تعرض بالإنجليزية حسب قرار العميل.

```typescript
const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

// النتيجة: April 3, 2026

// مع الوقت
const formatDateTime = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
```

### التقويم
- الافتراضي: ميلادي (gregory)
- لو المشروع حكومي: هجري متاح كخيار

## 5. معايير UX للمستخدم السعودي

### أحجام اللمس
```css
/* الحد الأدنى لأي عنصر تفاعلي */
min-height: 44px;
min-width: 44px;
```

### الحقول (Inputs)
```tsx
// Label فوق الحقل دائماً (ليس بجانبه)
<div className="flex flex-col gap-1.5">
  <label className="text-sm font-medium text-stone-700">
    الاسم الكامل
  </label>
  <input
    className="rounded-xl border border-stone-200 px-4 py-3 text-base"
    placeholder="أدخل اسمك الكامل"
  />
</div>

// رسائل الخطأ بالعربي تحت الحقل
<p className="text-sm text-red-500 mt-1">هذا الحقل مطلوب</p>
```

### رسائل النظام — دائماً بالعربي
```typescript
const messages = {
  success: "تمت العملية بنجاح",
  error: "حدث خطأ، حاول مرة أخرى",
  loading: "جارٍ التحميل...",
  empty: "لا توجد نتائج",
  confirm: "هل أنت متأكد؟",
  delete: "هل تريد الحذف؟ لا يمكن التراجع عن هذا الإجراء",
  save: "تم الحفظ",
  required: "هذا الحقل مطلوب",
  invalidEmail: "البريد الإلكتروني غير صحيح",
  invalidPhone: "رقم الجوال غير صحيح",
  minLength: (n: number) => `يجب أن يكون ${n} أحرف على الأقل`,
  maxLength: (n: number) => `يجب ألا يتجاوز ${n} حرف`,
};
```

### العناوين السعودية
```typescript
interface SaudiAddress {
  city: string;          // المدينة
  district: string;      // الحي
  street: string;        // الشارع
  buildingNo?: string;   // رقم المبنى
  postalCode: string;    // الرمز البريدي (5 أرقام)
  additionalNo?: string; // الرقم الإضافي (4 أرقام)
}

// المدن الرئيسية
const saudiCities = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة",
  "الدمام", "الخبر", "الظهران", "تبوك", "أبها",
  "الطائف", "بريدة", "نجران", "جازان", "ينبع",
];
```

## 6. الممنوعات
- ❌ لا تستخدم `text-left` أو `text-right` — استخدم `text-start` / `text-end`
- ❌ لا تستخدم `ml/mr/pl/pr` — استخدم `ms/me/ps/pe`
- ⚠️ ⚠️ الأرقام والتواريخ: استخدم en-US حسب قرار العميل (1,200.00 SAR)
- ❌ لا تستخدم خطوط غير داعمة للعربي
- ❌ لا تكتب رسائل النظام بالإنجليزي (فقط الرسائل للمستخدم تكون عربي)
- ❌ لا تتجاهل line-height المناسب للعربي
