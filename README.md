# 🧾 فواتيري — Fawateeri

> نظام داخلي ذكي لإدارة الفواتير — يجمع، يحلل، ويرتب فواتيرك تلقائياً

[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-Private-red)](LICENSE)

---

## 📖 نظرة عامة

**فواتيري** هو نظام داخلي لإدارة الفواتير بطريقة ذكية وآلية:

- 📧 **جمع تلقائي**: استقبال الفواتير من الإيميل عبر Make.com
- 🤖 **تحليل ذكي**: استخراج البيانات من الفواتير باستخدام GPT-4o
- 📁 **تخزين آمن**: حفظ ملفات PDF في Google Drive
- 📊 **واجهة احترافية**: Dashboard داكن عصري باللغة العربية
- 🔐 **إدارة صلاحيات**: نظام كامل للمستخدمين (أدمن / مشاهد / فريق)

---

## ✨ المزايا الرئيسية

### 🔄 أتمتة كاملة
- استقبال الفواتير من الإيميل تلقائياً
- تحليل محتوى الفاتورة واستخراج البيانات (رقم الفاتورة، المورد، المبلغ، التواريخ)
- تخزين PDF في Google Drive
- تصنيف حسب الحالة (جديدة / مدفوعة) والشهر

### 👥 ثلاثة أنواع من المستخدمين
| النوع | الصلاحيات |
|-------|-----------|
| **أدمن** | كل شيء: إدارة المستخدمين، تعديل، حذف، إعدادات |
| **مشاهد** | مشاهدة كاملة + تعديل حالة الفاتورة لـ "مدفوعة" |
| **فريق** | إضافة فواتير جديدة فقط |

### 🎨 تصميم احترافي
- ثيم داكن مستوحى من UI UX Pro Max
- دعم كامل للغة العربية (RTL)
- Responsive (جوال + ديسكتوب)
- بدون أنيميشن (سرعة وبساطة)

### 🔐 أمان متقدم
- JWT authentication مع bcrypt
- Role-based access control
- Middleware لحماية الـ routes
- Webhook secret للتحقق من Make.com

---

## 🛠️ التقنيات المستخدمة

### Frontend & Backend
- **Next.js 16.2.2** (App Router)
- **TypeScript 6.0.2** (strict mode)
- **Tailwind CSS 3.4.17**

### قاعدة البيانات والتكاملات
- **Airtable** (قاعدة البيانات)
- **Google Drive API** (تخزين الملفات)
- **OpenAI GPT-4o** (تحليل الفواتير)
- **Make.com** (أتمتة الإيميل)

### مكتبات أساسية
- **jose** 6.2.2 (JWT)
- **bcryptjs** 3.0.3 (تشفير كلمات السر)
- **zod** 4.3.6 (validation)
- **react-hook-form** 7.72.1
- **recharts** 3.8.1 (الرسوم البيانية)
- **lucide-react** 1.7.0 (الأيقونات)

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+ و npm
- حساب Airtable
- Google Cloud service account (للـ Drive)
- OpenAI API key
- Make.com account (للأتمتة)

### 1. التثبيت

```bash
# استنساخ المشروع
git clone https://github.com/your-repo/fawateeri.git
cd fawateeri

# تثبيت المكتبات
npm install
```

### 2. إعداد المتغيرات البيئية

انسخ `.env.example` إلى `.env.local` وعبّي القيم:

```bash
cp .env.example .env.local
```

**المتغيرات المطلوبة:**

```env
# Airtable
AIRTABLE_API_KEY=pat...
AIRTABLE_BASE_ID=app...
AIRTABLE_INVOICES_TABLE=tbl...
AIRTABLE_USERS_TABLE=tbl...

# JWT
JWT_SECRET=your-random-secret-here

# Google Drive
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account",...}
GOOGLE_DRIVE_FOLDER_ID=1xxx...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Make.com
MAKE_WEBHOOK_SECRET=your-webhook-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. إعداد Airtable

أنشئ Base جديد في Airtable مع جدولين:

**جدول Users:**
- username (Single line text)
- display_name (Single line text)
- password_hash (Single line text)
- role (Single select: admin, viewer, team)
- is_active (Checkbox)
- created_at (Date)

**جدول Invoices:**
- invoice_number (Single line text)
- vendor_name (Single line text)
- amount (Currency)
- currency (Single select: SAR)
- invoice_date (Date)
- due_date (Date)
- status (Single select: جديدة, مدفوعة)
- pdf_url (URL)
- payment_link (URL)
- uploaded_by (Single line text)
- uploaded_at (Date)
- paid_at (Date)
- paid_by (Single line text)
- notes (Long text)
- source (Single select: إيميل, يدوي)
- month_year (Single line text)

### 4. تشغيل المشروع

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

افتح [http://localhost:3000](http://localhost:3000)

---

## 📚 التوثيق

### API Documentation
للتوثيق الكامل لجميع الـ API endpoints، راجع [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### ملفات التوثيق الأخرى

```
docs/
├── MASTER-PLAN.md         ← الخطة الرئيسية للمشروع
├── CURRENT-PHASE.md       ← المرحلة الحالية
├── DECISIONS.md           ← قرارات التصميم والتطوير
├── USER-FLOWS.md          ← تدفقات المستخدم
├── backend_tasks.md       ← مهام Backend
├── backend_logs.md        ← سجل تنفيذ Backend
├── UI_tasks.md            ← مهام UI
├── UI_logs.md             ← سجل تنفيذ UI
└── fixes_log.md           ← سجل الإصلاحات
```

---

## 🏗️ بنية المشروع

```
fawateeri/
├── src/
│   ├── app/
│   │   ├── (auth)/login/       # صفحة تسجيل الدخول
│   │   ├── (dashboard)/        # صفحات Dashboard
│   │   ├── (admin)/users/      # إدارة المستخدمين
│   │   └── api/                # API endpoints
│   │       ├── auth/
│   │       ├── users/
│   │       ├── invoices/
│   │       ├── upload/
│   │       ├── ai/
│   │       └── webhook/
│   ├── components/
│   │   ├── ui/                 # مكونات UI الأساسية
│   │   ├── forms/              # نماذج الإدخال
│   │   ├── layouts/            # Layout مكونات
│   │   └── shared/             # مكونات مشتركة
│   ├── lib/
│   │   ├── airtable.ts         # Airtable client
│   │   ├── auth.ts             # JWT utilities
│   │   ├── google-drive.ts     # Google Drive API
│   │   ├── openai.ts           # OpenAI GPT-4o
│   │   ├── validations.ts      # Zod schemas
│   │   └── utils.ts            # دوال مساعدة
│   ├── hooks/                  # React hooks
│   └── types/                  # TypeScript types
├── docs/                       # التوثيق
├── public/                     # الملفات الثابتة
├── .env.example                # مثال متغيرات البيئة
├── middleware.ts               # Next.js middleware
└── tailwind.config.ts          # إعدادات Tailwind
```

---

## 🔌 API Endpoints

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول

### المستخدمين (admin فقط)
- `GET /api/users` - جلب جميع المستخدمين
- `POST /api/users` - إنشاء مستخدم جديد
- `GET /api/users/[id]` - جلب مستخدم واحد
- `PATCH /api/users/[id]` - تحديث مستخدم
- `DELETE /api/users/[id]` - تعطيل مستخدم

### الفواتير
- `GET /api/invoices` - جلب الفواتير (مع فلترة)
- `POST /api/invoices` - إنشاء فاتورة
- `GET /api/invoices/[id]` - جلب فاتورة واحدة
- `PATCH /api/invoices/[id]` - تحديث حالة فاتورة

### الملفات والذكاء الاصطناعي
- `POST /api/upload` - رفع PDF إلى Google Drive
- `POST /api/ai/analyze` - تحليل فاتورة بالذكاء الاصطناعي

### Webhook
- `POST /api/webhook/make` - استقبال فواتير من Make.com

---

## 🧪 الاختبار

### اختبار يدوي

```bash
# تسجيل دخول
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# جلب الفواتير
curl -X GET "http://localhost:3000/api/invoices?status=جديدة" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

راجع [API_DOCUMENTATION.md](API_DOCUMENTATION.md) لأمثلة أكثر.

---

## 📋 قواعد التطوير

### قواعد الكود
- ✅ TypeScript strict mode دائماً
- ✅ لا `any` — types محددة
- ✅ رسائل الخطأ بالعربية
- ✅ استخدام `ps/pe/ms/me` بدل `pl/pr/ml/mr` (RTL)
- ❌ لا console.log في production
- ❌ لا أنيميشن أو transitions معقدة

### Git Workflow
```bash
# إنشاء branch جديد
git checkout -b feature/feature-name

# Commit مع رسالة واضحة
git commit -m "إضافة: وصف التغيير"

# Push
git push origin feature/feature-name
```

### أنواع Commits
- `إضافة:` - ميزة جديدة
- `تحديث:` - تحسين ميزة موجودة
- `إصلاح:` - bug fix
- `تنسيق:` - تنسيق الكود
- `توثيق:` - تحديث التوثيق

---

## 🔧 استكشاف الأخطاء

### مشكلة: خطأ في الاتصال بـ Airtable
```bash
# تحقق من AIRTABLE_API_KEY و AIRTABLE_BASE_ID
# تأكد من الصلاحيات في Airtable
```

### مشكلة: Google Drive لا يعمل
```bash
# تأكد من GOOGLE_DRIVE_CREDENTIALS صحيح (JSON string كامل)
# تحقق من صلاحيات الـ service account
# تأكد من GOOGLE_DRIVE_FOLDER_ID صحيح
```

### مشكلة: JWT token منتهي
```bash
# قم بتسجيل الدخول مرة أخرى
# JWT tokens تنتهي بعد 7 أيام
```

---

## 📊 حالة المشروع

### ✅ مكتمل
- [x] Backend API كامل (11/11 مهمة)
- [x] المصادقة والأمان
- [x] Google Drive integration
- [x] OpenAI integration
- [x] Make.com webhook
- [x] التوثيق الكامل

### 🚧 قيد العمل
- [ ] UI/Frontend (0/X مهمة)

### 📅 المخطط
- [ ] تحسين الأداء
- [ ] النشر على Vercel
- [ ] اختبار حقيقي

---

## 👥 الفريق

- **ضياء الدين** - مطور ومدير المشروع

---

## 📝 الترخيص

هذا المشروع **خاص** ومخصص للاستخدام الداخلي فقط.

---

## 🙏 شكر وتقدير

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Airtable](https://airtable.com/) - Database
- [OpenAI](https://openai.com/) - GPT-4o
- [Google Drive](https://drive.google.com/) - File storage
- [Make.com](https://make.com/) - Automation

---

**صنع بـ ❤️ في السعودية**
