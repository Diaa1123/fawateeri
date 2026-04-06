---
name: git-workflow
description: نظام التحكم بالنسخ وسير عمل Git. يُستخدم تلقائياً عند إنشاء commits، إنشاء branches، دمج التعديلات، أو أي عملية Git. يشمل تسمية الـ branches والـ commits، متى تحفظ، وكيف تتعامل مع الأخطاء.
---

# Git Workflow — نظام التحكم بالنسخ

## متى تُستخدم هذه المهارة
- عند إنشاء commit
- عند إنشاء branch جديد
- عند دمج التعديلات
- عند حصول خطأ وتحتاج ترجع

## 1. متى تسوي Commit

### القاعدة: كل مهمة مكتملة = commit

```bash
# بعد إكمال كل مهمة من المهام المرقّمة (1.1, 1.2, etc.)
# سوّ commit فوراً قبل ما تبدأ المهمة التالية

# الدورة:
# نفّذ مهمة 1.1 ← commit ← نفّذ مهمة 1.2 ← commit ← نفّذ مهمة 1.3 ← commit ← توقف وأبلغ
```

### حالات إضافية تستدعي commit:
- بعد إصلاح bug
- بعد تعديل schema وتنفيذ migration
- قبل أي تعديل كبير أو خطير (commit كنقطة أمان)

### لا تسوي commit عند:
- تعديل لم يكتمل (نص مهمة)
- كود فيه أخطاء تمنع البناء
- ملفات تجريبية مؤقتة

## 2. تسمية الـ Commits

### التنسيق:
```
[نوع]: [رقم المهمة] — [وصف مختصر بالإنجليزي]
```

### الأنواع:
```
feat     ← ميزة جديدة
fix      ← إصلاح خطأ
refactor ← إعادة هيكلة بدون تغيير الوظيفة
style    ← تعديلات شكلية (CSS, تنسيق)
chore    ← أعمال صيانة (تحديث مكتبات, إعدادات)
docs     ← تحديث وثائق
schema   ← تعديل قاعدة البيانات
```

### أمثلة:
```bash
git commit -m "feat: 1.1 — create product and category schema"
git commit -m "feat: 1.2 — add product CRUD API endpoints"
git commit -m "fix: 1.2 — handle empty product images array"
git commit -m "schema: 1.1 — add artisan model with relations"
git commit -m "style: 1.4 — product card RTL layout fixes"
git commit -m "chore: update prisma to 6.x"
```

### ممنوع:
```bash
# ❌ رسائل غامضة
git commit -m "updates"
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "changes"

# ❌ عربي في رسالة الـ commit
git commit -m "إصلاح صفحة المنتجات"
```

## 3. نظام الـ Branches

### البنية:
```
main                    ← الإنتاج (لا تشتغل عليه مباشرة أبداً)
├── dev                 ← التطوير الرئيسي
├── feature/1.1-product-schema    ← ميزة جديدة
├── feature/1.4-product-page      ← ميزة جديدة
├── fix/1.2-empty-images          ← إصلاح
└── hotfix/payment-crash          ← إصلاح عاجل في الإنتاج
```

### تسمية الـ Branch:
```
[نوع]/[رقم المهمة]-[وصف-مختصر]

feature/1.1-product-schema
feature/2.3-checkout-page
fix/1.4-rtl-alignment
hotfix/moyasar-callback
```

### سير العمل:
```bash
# 1. ابدأ من dev
git checkout dev
git pull origin dev

# 2. أنشئ branch للميزة
git checkout -b feature/1.1-product-schema

# 3. اشتغل ← commit بعد كل مهمة
git add .
git commit -m "feat: 1.1 — create product schema"

# 4. لما تخلص المهام (أو مجموعة مرتبطة)
git push origin feature/1.1-product-schema

# 5. ادمج في dev
git checkout dev
git merge feature/1.1-product-schema

# 6. لما المرحلة تكتمل وتتختبر ← ادمج في main
git checkout main
git merge dev
git tag v1.0.0
```

## 4. متى تستخدم كل نوع Branch

```
feature/*  ← أي ميزة جديدة (الأكثر استخداماً)
fix/*      ← إصلاح bug في dev
hotfix/*   ← إصلاح عاجل في production (نادر)
refactor/* ← إعادة هيكلة كبيرة
```

## 5. قبل كل جلسة عمل

```bash
# تأكد إنك على آخر نسخة
git status          # شوف حالة الملفات
git pull            # جلب آخر التحديثات

# لو فيه تعديلات غير محفوظة:
git stash           # احفظها مؤقتاً
git pull
git stash pop       # رجّعها
```

## 6. التراجع عن الأخطاء

### الـ Agent خرّب ملفات (قبل commit):
```bash
# ارجع كل الملفات لآخر commit
git checkout .

# أو ارجع ملف محدد
git checkout -- src/app/page.tsx
```

### الـ Agent سوّى commit غلط:
```bash
# تراجع عن آخر commit (يحافظ على التعديلات)
git reset --soft HEAD~1

# تراجع عن آخر commit (يحذف التعديلات)
git reset --hard HEAD~1
```

### تراجع عن commit قديم بأمان:
```bash
# ينشئ commit جديد يلغي commit قديم
git revert <commit-hash>
```

## 7. ملفات لا تُرفع على Git

### .gitignore الأساسي:
```gitignore
# Dependencies
node_modules/

# Environment
.env
.env.local
.env.production

# Next.js
.next/
out/

# Build
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/*.db

# Logs
*.log

# Claude (اختياري — لو تبي تشارك skills أبقها)
# .claude/
```

## 8. قواعد للـ Agent

```
✅ افعل:
- commit بعد كل مهمة مكتملة
- رسالة commit واضحة بالتنسيق المحدد
- تحقق من git status قبل بدء العمل
- اعمل branch لكل ميزة كبيرة

❌ لا تفعل:
- لا تعمل commit لكود فيه أخطاء build
- لا تشتغل على main مباشرة
- لا ترفع .env على Git
- لا تعمل force push بدون إذن
- لا تحذف branches بدون إذن
- لا تعمل git reset --hard بدون إذن
```
