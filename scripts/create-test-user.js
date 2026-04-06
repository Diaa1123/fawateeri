// سكريبت لإنشاء مستخدم تجريبي في Airtable
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const AIRTABLE_USERS_TABLE = process.env.AIRTABLE_USERS_TABLE || 'Users';

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    console.error('❌ Error: AIRTABLE_API_KEY and AIRTABLE_BASE_ID are required in .env.local');
    process.exit(1);
  }

  // بيانات المستخدم التجريبي
  const username = 'admin';
  const password = 'admin123';
  const display_name = 'المدير';
  const role = 'admin';

  // تشفير كلمة السر
  const password_hash = await bcrypt.hash(password, 10);

  // إنشاء السجل في Airtable
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_USERS_TABLE}`;

  const body = {
    fields: {
      username,
      display_name,
      password_hash,
      role,
      is_active: true,
      created_at: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Airtable Error: ${error}`);
    }

    const result = await response.json();

    console.log('✅ تم إنشاء المستخدم التجريبي بنجاح!');
    console.log('');
    console.log('📋 بيانات الدخول:');
    console.log('   اسم المستخدم: admin');
    console.log('   كلمة السر: admin123');
    console.log('   الدور: admin');
    console.log('');
    console.log('🔗 الآن افتح: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error.message);
    process.exit(1);
  }
}

createTestUser();
