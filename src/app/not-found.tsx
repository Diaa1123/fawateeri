import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-12 h-12 text-accent-blue" />
          </div>
          <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            الصفحة غير موجودة
          </h2>
          <p className="text-text-secondary mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
        </div>
        <Link href="/">
          <Button variant="primary" className="flex items-center justify-center gap-2 mx-auto">
            <Home className="w-5 h-5" />
            <span>العودة للصفحة الرئيسية</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
