import { useState, useEffect } from 'react';

interface ToastProps {
  id?: number;
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const id = Date.now();
    const newToast = {
      ...props,
      id,
      duration: props.duration || 3000,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Remove toast after duration
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, newToast.duration);
  };

  return { toast };
}

// Simple Toast UI component
export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  // Global event listener for new toasts
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { toast } = event.detail;
      setToasts((prev) => [...prev, toast]);
      
      // Remove toast after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration || 3000);
    };

    window.addEventListener('toast' as any, handleToast as any);
    return () => window.removeEventListener('toast' as any, handleToast as any);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`rounded-md shadow-lg p-4 transition-all transform animate-in slide-in-from-right ${
            toast.variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          {toast.title && <h3 className="font-medium">{toast.title}</h3>}
          <p className="text-sm">{toast.description}</p>
        </div>
      ))}
    </div>
  );
}

export { type ToastProps }; 