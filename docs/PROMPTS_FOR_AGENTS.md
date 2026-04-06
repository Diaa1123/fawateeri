# PROMPTS FOR AGENTS — البرمبتات للنسخ المباشر

> انسخ البرمبتات أدناه مباشرة للوكيلين

---

## 🔵 Backend Agent — البرمبت الكامل

```
اقرأ الملفات التالية بالترتيب:
1. CLAUDE.md
2. docs/MASTER-PLAN.md
3. docs/CURRENT-PHASE.md
4. docs/backend_tasks.md
5. docs/backend_logs.md

ثم اقرأ docs/BACKEND_AGENT_PROMPT.md بالكامل واتبع التعليمات بدقة لتنفيذ المهام التالية:

المهام (حد أقصى 3):
- 1.1a: إعداد Airtable client + types + env vars
- 1.2a: نظام المصادقة (JWT) — login + middleware + role check
- 1.3a: API إدارة المستخدمين (CRUD) — أدمن فقط

⚠️ قواعد مهمة:
- استخدم Airtable REST API مباشرة (لا SDK)
- TypeScript strict mode (لا any)
- JWT بـ jose فقط + bcryptjs
- Validation بـ Zod
- سجّل كل إنجاز فوراً في backend_logs.md
- حدّث backend_tasks.md (غيّر [ ] إلى [x])
```

---

## 🟣 UI Agent — البرمبت الكامل

```
⚠️ الخطوة 0: تحميل UI UX Pro Max Skill أولاً
قبل أي شيء، نفّذ الأوامر التالية:

cd .claude/skills
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git
cd ../..

---

الخطوة 1: اقرأ الملفات التالية بالترتيب:
1. .claude/skills/ui-ux-pro-max-skill/SKILL.md (مرجع للتصميم)
2. CLAUDE.md (له الأولوية القصوى)
3. docs/MASTER-PLAN.md
4. docs/CURRENT-PHASE.md
5. docs/UI_tasks.md
6. docs/UI_logs.md

---

الخطوة 2: اقرأ docs/UI_AGENT_PROMPT.md بالكامل واتبع التعليمات بدقة لتنفيذ المهام التالية:

المهام (حد أقصى 2 — لأن 1.3b تنتظر Backend):
- 1.1b: إعداد المشروع + Tailwind + RTL + الثيم الداكن
- 1.2b: صفحة تسجيل الدخول

⚠️ قواعد مهمة:
- RTL أولاً (استخدم ps/pe بدل pl/pr، text-start/end بدل left/right)
- الألوان من CLAUDE.md فقط (لا تغيير!)
- لا أنيميشن (transitions بسيطة فقط)
- IBM Plex Sans Arabic للخطوط
- كل النصوص بالعربية
- UI UX Pro Max Skill للمرجع فقط، CLAUDE.md له الأولوية
- سجّل كل إنجاز فوراً في UI_logs.md
- حدّث UI_tasks.md (غيّر [ ] إلى [x])
```

---

## 📋 ملخص سريع

### Backend Agent
| المهمة | الوقت المتوقع | الاعتماديات |
|--------|---------------|-------------|
| 1.1a — Airtable + types | 30-45 دقيقة | لا يوجد ✅ |
| 1.2a — JWT + middleware | 45-60 دقيقة | 1.1a |
| 1.3a — API المستخدمين | 30-40 دقيقة | 1.2a |
| **الإجمالي** | **~2-2.5 ساعة** | |

### UI Agent
| المهمة | الوقت المتوقع | الاعتماديات |
|--------|---------------|-------------|
| تحميل UI UX Skill | 2-3 دقائق | لا يوجد ✅ |
| 1.1b — Tailwind + RTL | 45-60 دقيقة | لا يوجد ✅ |
| 1.2b — صفحة Login | 30-40 دقيقة | 1.1b |
| **الإجمالي** | **~1.5 ساعة** | |

---

## ✅ Checklist قبل البدء

### Backend Agent
- [ ] قرأت BACKEND_AGENT_PROMPT.md كاملاً
- [ ] فهمت: Airtable REST API, JWT (jose), Zod
- [ ] عارف إني ما استخدم أي SDK خارجي

### UI Agent
- [ ] حمّلت UI UX Pro Max Skill
- [ ] قرأت UI_AGENT_PROMPT.md كاملاً
- [ ] فهمت RTL rules وألوان CLAUDE.md
- [ ] عارف إني ما استخدم shadcn أو أي مكتبة UI

---

## 🎯 النتيجة المتوقعة

**Backend:**
- ✅ Airtable client + types
- ✅ JWT authentication
- ✅ Login API
- ✅ Middleware
- ✅ Users CRUD API

**UI:**
- ✅ Next.js + Tailwind + RTL
- ✅ Dark theme
- ✅ IBM Plex Sans Arabic
- ✅ Login page
- ✅ UI components (Input, Button)

---

**ملاحظة:** البرمبتات الكاملة موجودة في:
- [BACKEND_AGENT_PROMPT.md](BACKEND_AGENT_PROMPT.md)
- [UI_AGENT_PROMPT.md](UI_AGENT_PROMPT.md)
