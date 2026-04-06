# دليل النشر على Vercel — Deployment Guide

> آخر تحديث: أبريل 2026

---

## 🚀 خطوات النشر على Vercel

### 1. التحضيرات المطلوبة قبل النشر

#### ✅ التأكد من جاهزية الكود
```bash
# 1. التأكد من عدم وجود أخطاء TypeScript
npx tsc --noEmit

# 2. تشغيل البناء محلياً للتأكد من عدم وجود أخطاء
npm run build

# 3. اختبار البناء محلياً
npm run start
```

#### ✅ التأكد من ملفات Git
```bash
# تأكد أن جميع التغييرات محفوظة
git status

# إضافة التغييرات
git add .

# إنشاء commit
git commit -m "Prepare for Vercel deployment"

# رفع للريبو
git push origin main
```

---

### 2. إعداد المشروع على Vercel

#### الخطوة 1: إنشاء مشروع جديد
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجّل دخول بحساب GitHub
3. اضغط "Add New" → "Project"
4. اختر الريبو: `fawateeri`
5. اضغط "Import"

#### الخطوة 2: إعدادات المشروع
**Framework Preset:** Next.js (يتم اكتشافه تلقائياً)

**Build Settings:**
- Build Command: `next build` (افتراضي)
- Output Directory: `.next` (افتراضي)
- Install Command: `npm install` (افتراضي)

**Root Directory:** `./` (الجذر)

---

### 3. ⚙️ متغيرات البيئة (Environment Variables)

**مهم جداً:** يجب إضافة **جميع** المتغيرات التالية في Vercel Dashboard:

#### الانتقال لإعدادات المتغيرات:
`Project Settings` → `Environment Variables`

#### المتغيرات المطلوبة:

```bash
# ═══ Airtable ═══
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_INVOICES_TABLE=your_invoices_table_id
AIRTABLE_USERS_TABLE=your_users_table_id

# ═══ JWT ═══
JWT_SECRET=your_random_jwt_secret_here

# ═══ Google Drive ═══
GOOGLE_DRIVE_CREDENTIALS=your_google_drive_credentials_here
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id

# ═══ OpenAI ═══
OPENAI_API_KEY=your_openai_api_key_here

# ═══ Make.com Webhook ═══
MAKE_WEBHOOK_SECRET=your_webhook_secret_here

# ═══ App URL ═══
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

**💡 مهم:** القيم الفعلية موجودة في ملف `.env.local` المحلي لديك. انسخها منه وألصقها في Vercel Dashboard.

**ملاحظات مهمة:**
1. **NEXT_PUBLIC_APP_URL**: غيّره بعد النشر الأول للرابط الفعلي من Vercel
2. **GOOGLE_DRIVE_CREDENTIALS**: تأكد من نسخ المفتاح كامل مع `\n` (new lines)
3. لكل متغير، اختر البيئة: `Production`, `Preview`, `Development` (أو حسب الحاجة)

---

### 4. 🔄 إعادة النشر بعد التغييرات

#### تلقائي (موصى به):
كل `git push` للـ `main` branch سيُشغّل نشر تلقائي على Vercel

#### يدوي:
1. Vercel Dashboard → Project → Deployments
2. اضغط "Redeploy" على آخر deployment

---

### 5. ⚠️ المشاكل الشائعة والحلول

#### مشكلة: Build فشل بسبب TypeScript errors
**الحل:**
```bash
# محلياً:
npx tsc --noEmit
# اصلح الأخطاء، ثم:
git add .
git commit -m "Fix TypeScript errors"
git push
```

#### مشكلة: API routes ترجع 500
**السبب:** متغيرات البيئة غير موجودة أو خاطئة

**الحل:**
1. Vercel Dashboard → Settings → Environment Variables
2. تأكد أن **جميع** المتغيرات موجودة
3. اضغط "Redeploy"

#### مشكلة: CORS errors عند استخدام API
**الحل:** تأكد أن `NEXT_PUBLIC_APP_URL` يطابق الرابط الفعلي

#### مشكلة: Google Drive API لا يعمل
**السبب:** `GOOGLE_DRIVE_CREDENTIALS` منسوخ بشكل خاطئ

**الحل:**
1. انسخ المفتاح من `.env.local` **كما هو** (مع `\n`)
2. الصقه في Vercel Environment Variables
3. Redeploy

#### مشكلة: الخطوط العربية لا تظهر
**الحل:** تأكد أن `globals.css` يحتوي على:
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
```

---

### 6. 📊 مراقبة الأداء

#### Vercel Analytics (مجاني):
1. Project Settings → Analytics
2. Enable Analytics
3. شاهد الإحصائيات في الـ Dashboard

#### Vercel Logs (للأخطاء):
1. Project → Deployments → (اختر deployment)
2. اضغط "View Function Logs"
3. راقب الأخطاء في real-time

---

### 7. 🔐 الأمان

#### تأكد من:
- ✅ `.env.local` **مو** موجود في Git (موجود في `.gitignore`)
- ✅ جميع المفاتيح السرية في Vercel Environment Variables فقط
- ✅ لا تشارك `AIRTABLE_API_KEY` أو `OPENAI_API_KEY` مع أحد
- ✅ `JWT_SECRET` عشوائي وطويل (UUID موصى به)

---

### 8. ✅ Checklist قبل النشر النهائي

- [ ] `npm run build` يعمل بدون أخطاء
- [ ] جميع متغيرات البيئة موجودة في Vercel
- [ ] `.gitignore` يتجاهل `.env.local`
- [ ] `NEXT_PUBLIC_APP_URL` محدّث للرابط الفعلي
- [ ] الخطوط العربية تظهر بشكل صحيح
- [ ] API routes تعمل (اختبار تسجيل الدخول)
- [ ] جميع الصفحات تفتح بدون أخطاء
- [ ] الصور والأيقونات تظهر
- [ ] RTL يعمل بشكل صحيح

---

### 9. 🔗 روابط مهمة

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables

---

## 🎉 بعد النشر

### تحديث NEXT_PUBLIC_APP_URL:
1. انسخ الرابط النهائي من Vercel (مثلاً: `https://fawateeri.vercel.app`)
2. Vercel Dashboard → Settings → Environment Variables
3. عدّل `NEXT_PUBLIC_APP_URL` للرابط الجديد
4. Redeploy

### اختبار كامل:
- ✅ تسجيل الدخول
- ✅ عرض الفواتير
- ✅ إضافة فاتورة جديدة
- ✅ تعديل حالة فاتورة
- ✅ رفع PDF
- ✅ ActivityLog يعمل

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع Vercel Function Logs
2. تأكد من Environment Variables
3. راجع `TROUBLESHOOTING.md` (إن وُجد)
4. راجع Vercel Community: https://github.com/vercel/vercel/discussions

---

**آخر تحديث:** 2026-04-06
**النسخة:** 1.0.0
