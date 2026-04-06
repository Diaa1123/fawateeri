# UI Agent — برمبت التنفيذ

> هذا البرمبت لـ UI Agent لتنفيذ المهام 1.1b, 1.2b

---

## 🎯 مهمتك

أنت **UI Agent** مسؤول عن بناء الواجهة الأمامية لمشروع **فواتيري**.

**المهام المطلوبة في هذه الجلسة (حد أقصى 2 مهمة — لأن 1.3b تنتظر Backend):**
1. **1.1b** — إعداد المشروع + Tailwind + RTL + الثيم الداكن
2. **1.2b** — صفحة تسجيل الدخول

---

## 🎨 الخطوة الأولى: تحميل UI UX Pro Max Skill

**⚠️ قبل البدء في أي مهمة، يجب تحميل مكتبة التصميم:**

```bash
# 1. انتقل إلى مجلد .claude/skills
cd .claude/skills

# 2. استنسخ المكتبة
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git

# 3. ارجع للمجلد الرئيسي
cd ../..
```

**بعد التحميل:**
- اقرأ ملف `.claude/skills/ui-ux-pro-max-skill/SKILL.md` لفهم المبادئ
- المشروع مستوحى من هذا الـ skill (ثيم داكن احترافي)
- لكن لا تنسخ الكود بشكل مباشر — استخدمه كمرجع للتصميم فقط
- الألوان والقواعد المحددة في `CLAUDE.md` لها الأولوية

---

## 📚 الملفات الإلزامية للقراءة

**اقرأ هذه الملفات بالترتيب قبل البدء:**

1. **`.claude/skills/ui-ux-pro-max-skill/SKILL.md`** — مبادئ التصميم الاحترافي (مرجع)
2. **`CLAUDE.md`** — القواعد العامة للمشروع (التصميم، الألوان، RTL، الممنوعات) ← **الأولوية**
3. **`docs/MASTER-PLAN.md`** — الخطة الرئيسية للمشروع
4. **`docs/CURRENT-PHASE.md`** — المرحلة الحالية (المرحلة 1)
5. **`docs/UI_tasks.md`** — مهامك المفصلة
6. **`docs/UI_logs.md`** — سجل التقدم (ستكتب فيه بعد كل مهمة)

---

## 📋 تفاصيل المهام

### المهمة 1.1b — إعداد المشروج + Tailwind + RTL + الثيم الداكن

**الهدف:** إعداد Next.js بالكامل مع Tailwind CSS، الثيم الداكن، RTL، والخطوط العربية.

**الملفات المطلوبة:**
```
tailwind.config.ts       ← تكوين Tailwind + الألوان
src/
  app/
    globals.css          ← CSS variables + RTL defaults
    layout.tsx           ← Root layout + Font + dir="rtl"
```

---

#### 1. `tailwind.config.ts`

**المتطلبات:**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // الخلفيات
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#111827',
        'bg-card': '#1a2035',
        'bg-card-hover': '#1f2847',
        'bg-sidebar': '#0d1220',

        // النصوص
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',

        // الألوان الوظيفية
        'accent-blue': '#3b82f6',
        'accent-blue-glow': '#2563eb',
        'accent-green': '#22c55e',
        'accent-red': '#ef4444',
        'accent-amber': '#f59e0b',
        'accent-purple': '#8b5cf6',

        // الحدود
        'border-default': '#1e293b',
        'border-accent': '#334155',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-sans-arabic)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

**⚠️ ملاحظات:**
- كل الألوان من `CLAUDE.md` — قواعد التصميم
- لا تغيّر الألوان أبداً بدون إذن
- استخدم `var(--font-ibm-plex-sans-arabic)` للخط العربي

---

#### 2. `src/app/globals.css`

**المتطلبات:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* الخلفيات */
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-card: #1a2035;
  --bg-card-hover: #1f2847;
  --bg-sidebar: #0d1220;

  /* النصوص */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* الألوان الوظيفية */
  --accent-blue: #3b82f6;
  --accent-blue-glow: #2563eb;
  --accent-green: #22c55e;
  --accent-red: #ef4444;
  --accent-amber: #f59e0b;
  --accent-purple: #8b5cf6;

  /* الحدود */
  --border-default: #1e293b;
  --border-accent: #334155;

  /* التدرجات */
  --gradient-header: linear-gradient(135deg, #1a2035 0%, #0f172a 100%);
  --gradient-card-highlight: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.05) 100%);
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  direction: rtl;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-ibm-plex-sans-arabic), system-ui, sans-serif;
  line-height: 1.7;
  font-size: 14px;
}

/* Scrollbar styling للثيم الداكن */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-accent);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-blue);
}

/* لا أنيميشن — فقط transitions بسيطة */
a, button {
  transition: background-color 150ms, color 150ms, opacity 150ms;
}
```

---

#### 3. `src/app/layout.tsx`

**المتطلبات:**

```typescript
import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-ibm-plex-sans-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'فواتيري — نظام إدارة الفواتير',
  description: 'نظام داخلي لإدارة الفواتير تلقائياً',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexSansArabic.variable}>
      <body>{children}</body>
    </html>
  );
}
```

**⚠️ ملاحظات:**
- `lang="ar"` — لغة عربية
- `dir="rtl"` — اتجاه من اليمين لليسار
- IBM Plex Sans Arabic — الخط الرسمي للمشروع
- Weights: 400 (عادي)، 500 (متوسط)، 600 (semi-bold)، 700 (bold)

---

### المهمة 1.2b — صفحة تسجيل الدخول

**الهدف:** صفحة login بسيطة واحترافية بالتصميم الداكن.

**الملفات المطلوبة:**
```
src/
  app/
    (auth)/
      login/
        page.tsx         ← صفحة تسجيل الدخول
  components/
    ui/
      Input.tsx          ← مكون input أساسي
      Button.tsx         ← مكون button أساسي
```

---

#### 1. `src/components/ui/Input.tsx`

**مكون Input قابل لإعادة الاستخدام:**

```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3 rounded-lg
          bg-bg-card border border-border-default
          text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-accent-red' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent-red">{error}</p>
      )}
    </div>
  );
}
```

---

#### 2. `src/components/ui/Button.tsx`

**مكون Button قابل لإعادة الاستخدام:**

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-accent-blue hover:bg-accent-blue-glow text-white',
    secondary: 'bg-bg-card hover:bg-bg-card-hover border border-border-default text-text-primary',
    danger: 'bg-accent-red hover:bg-red-600 text-white',
  };

  return (
    <button
      className={`
        px-4 py-3 rounded-lg font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-150
        flex items-center justify-center gap-2
        ${variantStyles[variant]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
```

---

#### 3. `src/app/(auth)/login/page.tsx`

**صفحة تسجيل الدخول:**

```typescript
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة السر');
      return;
    }

    setIsLoading(true);

    // TODO: المهمة 1.3b — سيتم ربطه بالـ Backend
    // في الوقت الحالي، فقط placeholder
    setTimeout(() => {
      setIsLoading(false);
      setError('لم يتم ربط Backend بعد — انتظر المهمة 1.3b');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-bg-card border border-border-default rounded-xl p-8">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              فواتيري
            </h1>
            <p className="text-text-secondary">
              نظام إدارة الفواتير
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="اسم المستخدم"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />

            <Input
              type="password"
              label="كلمة السر"
              placeholder="أدخل كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />

            {error && (
              <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-3">
                <p className="text-sm text-accent-red text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-text-muted text-sm mt-6">
          نظام داخلي — للاستخدام المصرح فقط
        </p>
      </div>
    </div>
  );
}
```

**⚠️ ملاحظات:**
- الصفحة `'use client'` — لأنها تستخدم useState
- التصميم مركز في الشاشة (centered)
- Error state واضح
- Loading state على الزر
- كل النصوص بالعربي
- RTL تلقائي من الـ layout

---

## ✅ معايير الإكمال

**المهمة تُعتبر مكتملة عندما:**

### 1.1b ✓
- [ ] Tailwind مُعدّ بكل الألوان من CLAUDE.md
- [ ] IBM Plex Sans Arabic يعمل
- [ ] `dir="rtl"` على الـ HTML
- [ ] الخلفية داكنة (--bg-primary)
- [ ] CSS variables كلها موجودة
- [ ] `npm run dev` يشتغل بدون أخطاء

### 1.2b ✓
- [ ] صفحة Login تظهر في المتصفح
- [ ] Input و Button يشتغلون
- [ ] التصميم داكن احترافي
- [ ] RTL يشتغل (النص من اليمين)
- [ ] Validation أساسية (required fields)
- [ ] Loading state يظهر على الزر
- [ ] Error message يظهر لو فيه خطأ

---

## 📝 التسجيل

**بعد كل مهمة:**
1. حدّث `docs/UI_tasks.md` — غيّر `[ ]` إلى `[x]`
2. سجّل في `docs/UI_logs.md`:
   ```markdown
   ### المهمة 1.1b — إعداد المشروع + Tailwind + RTL ✅
   **التاريخ**: 2026-04-04
   **المدة**: 40 دقيقة
   **الملفات المُنشأة**:
   - tailwind.config.ts
   - src/app/globals.css
   - src/app/layout.tsx (تحديث)

   **الملاحظات**:
   - كل الألوان من CLAUDE.md
   - IBM Plex Sans Arabic weights: 400, 500, 600, 700
   - RTL يشتغل بشكل صحيح
   - لا أنيميشن — فقط transitions بسيطة
   ```

---

## ⚠️ قواعد مهمة

### الممنوعات:
- ❌ لا shadcn/ui (نبني UI components يدوياً)
- ❌ لا framer-motion أو أي أنيميشن
- ❌ لا تغيير الألوان بدون إذن
- ❌ لا تستخدم `pl/pr/ml/mr` — استخدم `ps/pe/ms/me`
- ❌ لا تستخدم `text-left/right` — استخدم `text-start/end`
- ❌ لا أيقونات اتجاهية بدون `rtl:rotate-180`

### المطلوب:
- ✅ كل شيء بالعربية (UI text)
- ✅ RTL في كل مكان
- ✅ Tailwind CSS فقط للتصميم
- ✅ الألوان من CLAUDE.md بالضبط
- ✅ IBM Plex Sans Arabic
- ✅ Responsive (mobile-first)
- ✅ Dark theme فقط

---

## 🎨 مرجع الألوان السريع

**للنسخ واللصق:**

```tsx
// Backgrounds
className="bg-bg-primary"         // الخلفية الرئيسية
className="bg-bg-secondary"       // الخلفية الثانوية
className="bg-bg-card"            // خلفية البطاقات
className="bg-bg-card-hover"      // hover البطاقات
className="bg-bg-sidebar"         // خلفية القائمة الجانبية

// Text
className="text-text-primary"     // نص رئيسي
className="text-text-secondary"   // نص ثانوي
className="text-text-muted"       // نص خافت

// Accents
className="bg-accent-blue"        // أزرق رئيسي
className="bg-accent-green"       // أخضر (نجاح/مدفوع)
className="bg-accent-red"         // أحمر (خطأ/تحذير)
className="bg-accent-amber"       // برتقالي (انتباه)
className="bg-accent-purple"      // بنفسجي (مميز)

// Borders
className="border-border-default" // حدود عادية
className="border-border-accent"  // حدود بارزة
```

---

## 🚀 ابدأ الآن

**الترتيب:**
1. اقرأ الملفات الـ 5 المذكورة في الأعلى
2. نفّذ 1.1b
3. تأكد إن المشروع يشتغل (`npm run dev`)
4. سجّل في logs
5. نفّذ 1.2b
6. اختبر صفحة Login في المتصفح
7. سجّل في logs
8. أبلغ مدير المشروع: "تم إكمال مهمتين UI (1.1b + 1.2b)"

---

**ملاحظة نهائية:**
- المهمة 1.3b تنتظر Backend Agent (مهمة 1.2a) — لا تنفّذها الآن
- ركّز على جودة التصميم والتفاصيل
- لا تنسَ قراءة `CLAUDE.md` — فيه قواعد التصميم الحرجة!
