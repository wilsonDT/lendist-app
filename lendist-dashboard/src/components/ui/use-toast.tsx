import { useState, useEffect } from 'react';

interface ToastProps {
  id?: number;
  title?: string;
  description: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Define the shape of the event detail
interface ToastEventDetail {
  toast: ToastProps & { id: number };
}

export function useToast() {
  // Removed unused _toasts and setToasts state

  const toast = (props: ToastProps) => {
    const id = Date.now();
    const newToastWithId = {
      ...props,
      id,
      duration: props.duration || 3000, // Default duration if not provided
    };

    // Dispatch a global event for the ToastContainer to pick up
    window.dispatchEvent(new CustomEvent<ToastEventDetail>('toast', { 
      detail: { toast: newToastWithId }
    }));
  };

  return { toast };
}

// Simple Toast UI component
export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);

  // Global event listener for new toasts
  useEffect(() => {
    const handleToast = (event: CustomEvent<ToastEventDetail>) => {
      const { toast } = event.detail;
      setToasts((prev) => [...prev, toast]);
      
      // Remove toast after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration || 3000);
    };

    const eventListener = handleToast as EventListener;

    window.addEventListener('toast', eventListener);
    return () => window.removeEventListener('toast', eventListener);
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