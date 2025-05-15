"use client";

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, CreditCard, ChevronLeft, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useMobile } from "../hooks/use-mobile";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Borrowers",
    icon: Users,
    href: "/borrowers",
    color: "text-violet-500",
  },
  {
    label: "Loans",
    icon: CreditCard,
    href: "/loans",
    color: "text-pink-500",
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  useEffect(() => {
    // Close mobile sidebar when route changes
    const handleRouteChange = () => {
      setIsMobileOpen(false);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={toggleMobileSidebar}>
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "h-full bg-card border-r border-border/40 transition-all duration-300 z-50",
          isCollapsed ? "w-[80px]" : "w-[240px]",
          isMobile ? "fixed inset-y-0 left-0" : "relative",
          isMobile && !isMobileOpen && "hidden",
          isMobile && isMobileOpen && "block",
        )}
      >
        <div className="px-3 py-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8 pl-2">
            {!isCollapsed && <h1 className="text-xl font-bold">Lendist</h1>}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden md:flex">
              <ChevronLeft className={cn("h-5 w-5 transition-all", isCollapsed && "rotate-180")} />
            </Button>
          </div>
          <div className="space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-secondary/80 rounded-lg transition",
                  window.location.pathname === route.href ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                )}
              >
                <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "")}>
                  <route.icon className={cn("h-5 w-5", route.color, isCollapsed ? "mr-0" : "mr-3")} />
                  {!isCollapsed && <span>{route.label}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 