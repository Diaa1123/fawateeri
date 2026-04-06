# START HERE — ابدأ من هنا

> دليل سريع لبدء العمل مع الوكيلين (Backend Agent + UI Agent)

---

## 📁 الملفات الجاهزة

تم إنشاء كل ملفات التوثيق والتوزيع:

### ملفات التخطيط (للقراءة)
- ✅ **[MASTER-PLAN.md](MASTER-PLAN.md)** — الخطة الرئيسية الكاملة
- ✅ **[CURRENT-PHASE.md](CURRENT-PHASE.md)** — المرحلة الحالية: المرحلة 1
- ✅ **[backend_tasks.md](backend_tasks.md)** — 11 مهمة Backend
- ✅ **[UI_tasks.md](UI_tasks.md)** — 15 مهمة UI

### ملفات السجلات (للكتابة)
- ✅ **[backend_logs.md](backend_logs.md)** — سجل Backend Agent
- ✅ **[UI_logs.md](UI_logs.md)** — سجل UI Agent

### برمبتات التنفيذ (للوكيلين)
- ✅ **[BACKEND_AGENT_PROMPT.md](BACKEND_AGENT_PROMPT.md)** — تعليمات Backend Agent
- ✅ **[UI_AGENT_PROMPT.md](UI_AGENT_PROMPT.md)** — تعليمات UI Agent

---

## 🚀 كيف تبدأ

### للـ Backend Agent:

```bash
# افتح BACKEND_AGENT_PROMPT.md واقرأه بالكامل
# ثم نفّذ الأوامر التالية:

# 1. اقرأ الملفات المطلوبة (5 ملفات)
cat CLAUDE.md
cat docs/MASTER-PLAN.md
cat docs/CURRENT-PHASE.md
cat docs/backend_tasks.md
cat docs/backend_logs.md

# 2. نفّذ المهام الثلاث:
# - 1.1a: إعداد Airtable client + types
# - 1.2a: نظام المصادقة (JWT)
# - 1.3a: API إدارة المستخدمين

# 3. سجّل كل إنجاز في backend_logs.md
# 4. حدّث backend_tasks.md (غيّر [ ] إلى [x])
```

**البرمبت الكامل:** [BACKEND_AGENT_PROMPT.md](BACKEND_AGENT_PROMPT.md)

---

### للـ UI Agent:

```bash
# افتح UI_AGENT_PROMPT.md واقرأه بالكامل
# ثم نفّذ الأوامر التالية:

# ⚠️ 0. الخطوة الأولى: تحميل UI UX Pro Max Skill
cd .claude/skills
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git
cd ../..

# 1. اقرأ الملفات المطلوبة (6 ملفات)
cat .claude/skills/ui-ux-pro-max-skill/SKILL.md
cat CLAUDE.md
cat docs/MASTER-PLAN.md
cat docs/CURRENT-PHASE.md
cat docs/UI_tasks.md
cat docs/UI_logs.md

# 2. نفّذ المهمتين:
# - 1.1b: إعداد المشروع + Tailwind + RTL + الثيم الداكن
# - 1.2b: صفحة تسجيل الدخول

# 3. سجّل كل إنجاز في UI_logs.md
# 4. حدّث UI_tasks.md (غيّر [ ] إلى [x])
```

**البرمبت الكامل:** [UI_AGENT_PROMPT.md](UI_AGENT_PROMPT.md)

---

## 📊 المهام الحالية

### Backend Agent (3 مهام)
| # | المهمة | الحالة | الوقت المتوقع |
|---|--------|--------|---------------|
| 1.1a | إعداد Airtable client + types | ⏳ جاهز للبدء | 30-45 دقيقة |
| 1.2a | نظام المصادقة (JWT) | ⏸️ ينتظر 1.1a | 45-60 دقيقة |
| 1.3a | API إدارة المستخدمين | ⏸️ ينتظر 1.2a | 30-40 دقيقة |

**الإجمالي:** ~2-2.5 ساعة

---

### UI Agent (2 مهمة)
| # | المهمة | الحالة | الوقت المتوقع |
|---|--------|--------|---------------|
| 1.1b | إعداد المشروع + Tailwind + RTL | ⏳ جاهز للبدء | 45-60 دقيقة |
| 1.2b | صفحة تسجيل الدخول | ⏸️ ينتظر 1.1b | 30-40 دقيقة |

**الإجمالي:** ~1.5 ساعة

---

## ⚠️ قواعد مهمة

### لكلا الوكيلين:
1. **لا تنفّذ أكثر من 3 مهام** في جلسة واحدة
2. **تحقق من الاعتماديات** قبل البدء بأي مهمة
3. **سجّل فوراً** بعد كل إنجاز في الـ logs
4. **حدّث الحالة** في ملف tasks
5. **أبلغ مدير المشروع** بعد إنهاء المهام

### للـ Backend Agent:
- ✅ استخدم fetch API مباشرة (لا SDK)
- ✅ TypeScript strict mode (لا `any`)
- ✅ JWT بـ `jose` فقط
- ✅ Validation بـ Zod

### للـ UI Agent:
- ✅ RTL أولاً (`ps/pe`, `text-start/end`)
- ✅ الألوان من CLAUDE.md فقط
- ✅ لا أنيميشن (transitions بسيطة فقط)
- ✅ IBM Plex Sans Arabic
- ✅ كل النصوص بالعربية

---

## 🎯 النتيجة المتوقعة

**بعد إكمال Backend Agent (3 مهام):**
- ✅ اتصال Airtable يشتغل
- ✅ Types كاملة لـ Invoice و User
- ✅ نظام JWT للمصادقة
- ✅ API تسجيل دخول `/api/auth/login`
- ✅ Middleware يحمي routes
- ✅ API إدارة المستخدمين `/api/users`

**بعد إكمال UI Agent (2 مهمة):**
- ✅ Next.js + Tailwind + RTL يشتغل
- ✅ الثيم الداكن الاحترافي
- ✅ IBM Plex Sans Arabic محمّل
- ✅ صفحة Login جاهزة (بدون ربط Backend بعد)
- ✅ مكونات UI أساسية (Input, Button)

---

## 📞 التنسيق بين الوكيلين

### المهمة التالية (بعد هذه الجلسة):
**1.3b** — ربط صفحة Login بالـ Backend + redirect حسب الصلاحية

**الاعتماديات:**
- ✅ 1.2b (UI) — صفحة Login
- ✅ 1.2a (Backend) — API login + JWT

**حالياً:** UI Agent سينتهي من 1.2b، لكن لن يقدر ينفّذ 1.3b لحد ما Backend Agent يكمل 1.2a

---

## 🔄 سير العمل الموصى به

```
الوقت: 0:00
├─ Backend Agent يبدأ 1.1a
└─ UI Agent يبدأ 1.1b

الوقت: 0:45
├─ Backend Agent ينتهي من 1.1a → يبدأ 1.2a
└─ UI Agent ينتهي من 1.1b → يبدأ 1.2b

الوقت: 1:30
├─ Backend Agent ينتهي من 1.2a → يبدأ 1.3a
└─ UI Agent ينتهي من 1.2b → يتوقف (ينتظر 1.2a)

الوقت: 2:00
├─ Backend Agent ينتهي من 1.3a → يسجّل ويبلغ
└─ UI Agent جاهز لبدء 1.3b (في الجلسة القادمة)
```

---

## 📝 نموذج التسجيل

**في backend_logs.md أو UI_logs.md:**

```markdown
### المهمة X.Xa — [اسم المهمة] ✅
**التاريخ**: 2026-04-04
**المدة**: XX دقيقة
**الملفات المُنشأة**:
- path/to/file1.ts
- path/to/file2.tsx

**الملاحظات**:
- ملاحظة 1
- ملاحظة 2

**التحديات**:
- تحدي 1 وكيف تم حله

**التالي**:
- المهمة القادمة: X.X
```

---

## ✅ Checklist قبل البدء

### للـ Backend Agent:
- [ ] قرأت BACKEND_AGENT_PROMPT.md كاملاً
- [ ] قرأت CLAUDE.md (قسم Backend)
- [ ] قرأت backend_tasks.md
- [ ] فهمت التقنيات: Airtable REST API, JWT (jose), Zod
- [ ] عارف إني ما استخدم أي SDK خارجي

### للـ UI Agent:
- [ ] قرأت UI_AGENT_PROMPT.md كاملاً
- [ ] قرأت CLAUDE.md (قسم التصميم)
- [ ] قرأت UI_tasks.md
- [ ] فهمت الألوان والثيم الداكن
- [ ] عارف RTL rules (ps/pe, text-start/end)
- [ ] عارف إني ما استخدم shadcn أو أي مكتبة UI

---

## 🎉 ابدأ الآن!

**Backend Agent:** افتح [BACKEND_AGENT_PROMPT.md](BACKEND_AGENT_PROMPT.md)
**UI Agent:** افتح [UI_AGENT_PROMPT.md](UI_AGENT_PROMPT.md)

**بالتوفيق! 🚀**
