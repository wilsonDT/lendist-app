import * as React from "react";
import { cn } from "../../lib/utils";

interface DialogProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => {
  const handleBackdropClick = () => {
    onOpenChange(false);
  };

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={handleBackdropClick} />
      <div className="z-50">{children}</div>
    </div>
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogContent: React.FC<DialogContentProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-card shadow-lg rounded-lg border border-border animate-in fade-in-90 slide-in-from-bottom-10 sm:zoom-in-90 sm:slide-in-from-bottom-0",
        className
      )} 
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const DialogFooter: React.FC<DialogFooterProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const DialogTitle: React.FC<DialogTitleProps> = ({ children, className, ...props }) => {
  return (
    <h2 
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  );
};

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className, ...props }) => {
  return (
    <p 
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
};

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }; 