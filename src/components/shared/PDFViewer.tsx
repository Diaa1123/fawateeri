'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Download, X } from 'lucide-react';

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
}

export function PDFViewer({ isOpen, onClose, pdfUrl, title = 'عرض الفاتورة' }: PDFViewerProps) {
  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title + '.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-bg-card border border-border-default rounded-xl shadow-xl w-full max-w-6xl h-[90vh] z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">فتح في تبويب جديد</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تحميل</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary transition-colors duration-150 rounded-lg hover:bg-bg-card-hover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>

        {/* Alternative: If iframe doesn't work, show a message */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-bg-card/90 backdrop-blur-sm border border-border-default rounded-xl p-6 text-center pointer-events-auto">
            <p className="text-text-secondary mb-4">
              لا يمكن عرض ملف PDF في المتصفح الحالي
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" onClick={handleOpenInNewTab}>
                فتح في تبويب جديد
              </Button>
              <Button variant="secondary" onClick={handleDownload}>
                تحميل الملف
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
