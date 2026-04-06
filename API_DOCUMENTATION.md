# 📚 توثيق API — فواتيري

> آخر تحديث: 2026-04-04

---

## 🔐 المصادقة (Authentication)

جميع الـ endpoints تتطلب JWT token ما عدا:
- `/api/auth/login` (تسجيل الدخول)
- `/api/webhook/make` (Webhook من Make.com)

### كيفية الاستخدام:

```http
Authorization: Bearer <your_jwt_token>
```

أو عبر Cookie:
```http
Cookie: token=<your_jwt_token>
```

---

## 📋 جدول المحتويات

1. [المصادقة (Auth)](#1-المصادقة-auth)
2. [المستخدمين (Users)](#2-المستخدمين-users)
3. [الفواتير (Invoices)](#3-الفواتير-invoices)
4. [رفع الملفات (Upload)](#4-رفع-الملفات-upload)
5. [الذكاء الاصطناعي (AI)](#5-الذكاء-الاصطناعي-ai)
6. [Webhook](#6-webhook)

---

## 1. المصادقة (Auth)

### POST `/api/auth/login`

تسجيل الدخول والحصول على JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "displayName": "ضياء الدين",
    "role": "admin"
  }
}
```

**Errors:**
- `400` - اسم المستخدم وكلمة السر مطلوبان
- `401` - اسم المستخدم أو كلمة السر غير صحيحة
- `403` - هذا الحساب معطّل

---

## 2. المستخدمين (Users)

> **ملاحظة:** جميع endpoints المستخدمين تتطلب صلاحية `admin`

### GET `/api/users`

جلب جميع المستخدمين (بدون password_hash).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "recXXX",
      "username": "admin",
      "display_name": "ضياء الدين",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-04-04T10:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/users`

إنشاء مستخدم جديد.

**Request:**
```json
{
  "username": "newuser",
  "display_name": "مستخدم جديد",
  "password": "password123",
  "role": "viewer"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "recXXX",
    "username": "newuser",
    "display_name": "مستخدم جديد",
    "role": "viewer",
    "is_active": true,
    "created_at": "2026-04-04T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - اسم المستخدم مستخدم بالفعل
- `400` - بيانات غير صحيحة (Zod validation)
- `403` - غير مصرح (ليس أدمن)

---

### GET `/api/users/[id]`

جلب مستخدم واحد بواسطة ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "recXXX",
    "username": "admin",
    "display_name": "ضياء الدين",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-04-04T10:00:00.000Z"
  }
}
```

**Errors:**
- `404` - المستخدم غير موجود

---

### PATCH `/api/users/[id]`

تحديث بيانات مستخدم (بدون كلمة السر).

**Request:**
```json
{
  "display_name": "اسم جديد",
  "role": "team",
  "is_active": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "recXXX",
    "username": "admin",
    "display_name": "اسم جديد",
    "role": "team",
    "is_active": false,
    "created_at": "2026-04-04T10:00:00.000Z"
  }
}
```

**Errors:**
- `404` - المستخدم غير موجود
- `400` - بيانات غير صحيحة

---

### DELETE `/api/users/[id]`

تعطيل مستخدم (soft delete - يغير is_active إلى false).

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `404` - المستخدم غير موجود

---

## 3. الفواتير (Invoices)

### GET `/api/invoices`

جلب قائمة الفواتير مع إمكانية الفلترة والترتيب.

**Query Parameters:**
- `status` (optional): `"جديدة"` | `"مدفوعة"`
- `month_year` (optional): `"2026-04"` (YYYY-MM)
- `limit` (optional): عدد الفواتير (default: 50)
- `offset` (optional): لـ pagination

**Examples:**
```http
GET /api/invoices
GET /api/invoices?status=جديدة
GET /api/invoices?month_year=2026-04
GET /api/invoices?status=مدفوعة&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "recXXX",
        "invoice_number": "INV-2026-001",
        "vendor_name": "شركة التوريدات",
        "amount": 5000,
        "currency": "SAR",
        "invoice_date": "2026-04-01",
        "due_date": "2026-04-30",
        "status": "جديدة",
        "pdf_url": "https://drive.google.com/...",
        "payment_link": "https://example.com/pay",
        "uploaded_by": "admin",
        "uploaded_at": "2026-04-04T10:00:00.000Z",
        "notes": "ملاحظات",
        "source": "يدوي",
        "month_year": "2026-04"
      }
    ],
    "offset": "recYYY"
  }
}
```

---

### GET `/api/invoices/[id]`

جلب فاتورة واحدة بواسطة ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "recXXX",
    "invoice_number": "INV-2026-001",
    "vendor_name": "شركة التوريدات",
    "amount": 5000,
    "currency": "SAR",
    "invoice_date": "2026-04-01",
    "due_date": "2026-04-30",
    "status": "مدفوعة",
    "pdf_url": "https://drive.google.com/...",
    "uploaded_by": "admin",
    "uploaded_at": "2026-04-04T10:00:00.000Z",
    "paid_at": "2026-04-05T12:00:00.000Z",
    "paid_by": "admin",
    "notes": "تم الدفع",
    "source": "يدوي",
    "month_year": "2026-04"
  }
}
```

**Errors:**
- `404` - الفاتورة غير موجودة

---

### POST `/api/invoices`

إنشاء فاتورة جديدة.

> **الصلاحيات:** الكل (admin, viewer, team)

**Request:**
```json
{
  "invoice_number": "INV-2026-001",
  "vendor_name": "شركة التوريدات",
  "amount": 5000,
  "currency": "SAR",
  "invoice_date": "2026-04-01",
  "due_date": "2026-04-30",
  "pdf_url": "https://drive.google.com/...",
  "payment_link": "https://example.com/pay",
  "notes": "ملاحظات",
  "source": "يدوي"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "recXXX",
    "invoice_number": "INV-2026-001",
    "vendor_name": "شركة التوريدات",
    "amount": 5000,
    "currency": "SAR",
    "invoice_date": "2026-04-01",
    "due_date": "2026-04-30",
    "status": "جديدة",
    "pdf_url": "https://drive.google.com/...",
    "uploaded_by": "admin",
    "uploaded_at": "2026-04-04T10:00:00.000Z",
    "month_year": "2026-04",
    "source": "يدوي"
  }
}
```

**Errors:**
- `400` - بيانات غير صحيحة (Zod validation)

---

### PATCH `/api/invoices/[id]`

تحديث حالة الفاتورة.

> **الصلاحيات:** admin و viewer فقط

**Request:**
```json
{
  "status": "مدفوعة"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "recXXX",
    "status": "مدفوعة",
    "paid_at": "2026-04-05T12:00:00.000Z",
    "paid_by": "admin",
    ...
  }
}
```

**Errors:**
- `400` - الحالة مطلوبة
- `400` - الحالة يجب أن تكون: جديدة أو مدفوعة
- `403` - غير مصرح (فقط admin و viewer)
- `404` - الفاتورة غير موجودة

---

## 4. رفع الملفات (Upload)

### POST `/api/upload`

رفع ملف PDF إلى Google Drive.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: PDF file (max 10MB)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "fileId": "1ABC...",
    "url": "https://drive.google.com/file/d/1ABC.../view"
  }
}
```

**Errors:**
- `400` - لم يتم رفع ملف
- `400` - نوع الملف غير صحيح (يجب أن يكون PDF)
- `400` - حجم الملف كبير جداً (الحد الأقصى 10MB)
- `500` - حدث خطأ أثناء رفع الملف

---

## 5. الذكاء الاصطناعي (AI)

### POST `/api/ai/analyze`

تحليل محتوى فاتورة باستخدام GPT-4o واستخراج البيانات.

**Request (نص):**
```json
{
  "text": "فاتورة رقم INV-001 من شركة المثال بمبلغ 5000 ريال..."
}
```

**Request (PDF URL):**
```json
{
  "pdfUrl": "https://drive.google.com/file/d/..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "extracted": {
      "invoice_number": "INV-001",
      "vendor_name": "شركة المثال",
      "amount": 5000,
      "currency": "SAR",
      "invoice_date": "2026-04-01",
      "due_date": "2026-04-30"
    },
    "confidence": "high",
    "rawResponse": "{...}"
  }
}
```

**Confidence Levels:**
- `high`: 5+ حقول مستخرجة
- `medium`: 3-4 حقول مستخرجة
- `low`: أقل من 3 حقول

**Errors:**
- `400` - يجب توفير محتوى نصي (text) أو رابط PDF (pdfUrl)
- `400` - النص قصير جداً (أقل من 10 أحرف)
- `400` - النص طويل جداً (أكثر من 10,000 حرف)
- `501` - تحليل PDF غير مدعوم حالياً

---

## 6. Webhook

### POST `/api/webhook/make`

استقبال الفواتير من Make.com automation.

> **ملاحظة:** هذا endpoint عام (لا يحتاج JWT) لكن يتطلب webhook secret

**Headers:**
```http
x-make-webhook-secret: your_webhook_secret
```

**Request:**
```json
{
  "invoice_number": "INV-2026-001",
  "vendor_name": "شركة التوريدات",
  "amount": 5000,
  "currency": "SAR",
  "invoice_date": "2026-04-01",
  "due_date": "2026-04-30",
  "pdf_url": "https://drive.google.com/...",
  "source_email": "vendor@example.com",
  "email_subject": "فاتورة شهر أبريل",
  "raw_text": "نص الفاتورة...",
  "needs_ai_analysis": true,
  "payment_link": "https://example.com/pay",
  "notes": "ملاحظات"
}
```

**Response (200):**
```json
{
  "success": true,
  "invoiceId": "recXXX",
  "message": "Invoice created successfully from Make.com"
}
```

**Errors:**
- `401` - Unauthorized webhook request (webhook secret غير صحيح)
- `400` - Missing required fields
- `500` - Failed to process webhook

**ملاحظات:**
- إذا كان `needs_ai_analysis: true` والـ `raw_text` موجود، سيتم استخدام AI لاستخراج البيانات
- البيانات المرسلة من Make.com لها الأولوية على بيانات AI
- يتم إضافة `uploaded_by: "Make.com Automation"` تلقائياً
- الحالة دائماً `"جديدة"`
- المصدر دائماً `"إيميل"`

---

## 🔒 الصلاحيات (Permissions)

| Endpoint | admin | viewer | team |
|----------|-------|--------|------|
| POST `/api/auth/login` | ✅ | ✅ | ✅ |
| GET `/api/users` | ✅ | ❌ | ❌ |
| POST `/api/users` | ✅ | ❌ | ❌ |
| GET `/api/users/[id]` | ✅ | ❌ | ❌ |
| PATCH `/api/users/[id]` | ✅ | ❌ | ❌ |
| DELETE `/api/users/[id]` | ✅ | ❌ | ❌ |
| GET `/api/invoices` | ✅ | ✅ | ✅ |
| GET `/api/invoices/[id]` | ✅ | ✅ | ✅ |
| POST `/api/invoices` | ✅ | ✅ | ✅ |
| PATCH `/api/invoices/[id]` | ✅ | ✅ | ❌ |
| POST `/api/upload` | ✅ | ✅ | ✅ |
| POST `/api/ai/analyze` | ✅ | ✅ | ✅ |
| POST `/api/webhook/make` | Public (مع webhook secret) |

---

## 📝 ملاحظات مهمة

### 1. Token Expiry
- JWT tokens تنتهي بعد **7 أيام**
- يجب تسجيل الدخول مرة أخرى عند انتهاء الصلاحية

### 2. Error Format
جميع الأخطاء تأتي بالصيغة التالية:
```json
{
  "success": false,
  "error": "رسالة الخطأ بالعربية"
}
```

### 3. Pagination
استخدم `offset` المُرجع من الـ response السابق للحصول على الصفحة التالية:
```http
GET /api/invoices?limit=50&offset=recXYZ
```

### 4. Date Format
جميع التواريخ بصيغة ISO 8601:
- `invoice_date`: `"2026-04-01"`
- `uploaded_at`: `"2026-04-04T10:00:00.000Z"`

### 5. Currency
العملة الافتراضية: `SAR` (ريال سعودي)

---

## 🧪 أمثلة استخدام (Examples)

### مثال 1: تسجيل دخول وجلب الفواتير

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Response: { "success": true, "token": "eyJ..." }

# 2. Get invoices
curl -X GET "http://localhost:3000/api/invoices?status=جديدة" \
  -H "Authorization: Bearer eyJ..."
```

### مثال 2: رفع PDF وإنشاء فاتورة

```bash
# 1. Upload PDF
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer eyJ..." \
  -F "file=@invoice.pdf"

# Response: { "success": true, "data": { "fileId": "...", "url": "..." } }

# 2. Create invoice
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-001",
    "vendor_name": "شركة المثال",
    "amount": 5000,
    "currency": "SAR",
    "invoice_date": "2026-04-01",
    "due_date": "2026-04-30",
    "pdf_url": "https://drive.google.com/...",
    "source": "يدوي"
  }'
```

### مثال 3: تحليل بالذكاء الاصطناعي وإنشاء فاتورة

```bash
# 1. Analyze invoice text
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"text":"فاتورة رقم INV-001 من شركة المثال..."}'

# 2. Use extracted data to create invoice
curl -X POST http://localhost:3000/api/invoices \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{...extracted data...}'
```

---

## 🚀 Status Codes

| Code | معنى |
|------|------|
| 200 | نجح الطلب |
| 201 | تم الإنشاء بنجاح |
| 400 | بيانات خاطئة |
| 401 | غير مصرح (تحتاج تسجيل دخول) |
| 403 | ممنوع (صلاحيات غير كافية) |
| 404 | غير موجود |
| 500 | خطأ في الخادم |
| 501 | غير مدعوم |

---

**🎉 انتهى التوثيق**
