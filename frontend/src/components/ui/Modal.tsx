import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full ${maxWidthClasses[maxWidth]} animate-in fade-in zoom-in-95 duration-150`}>
        <Card shadowColor="yellow" className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#F5F0EA]">
            <h3 className="text-lg font-black text-black">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg border-2 border-black bg-white hover:bg-red-100 hover:text-red-600 transition-colors shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};
