'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <div className="max-w-md w-full">
        <div className="bg-bg-card border border-border-default rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-accent-red" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-text-secondary mb-6">
            نعتذر عن الإزعاج. حدث خطأ أثناء معالجة طلبك.
          </p>
          {error.message && (
            <div className="bg-bg-primary border border-border-default rounded-lg p-4 mb-6 text-start">
              <p className="text-sm text-text-muted font-mono">
                {error.message}
              </p>
            </div>
          )}
          <Button
            variant="primary"
            onClick={reset}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>حاول مرة أخرى</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
