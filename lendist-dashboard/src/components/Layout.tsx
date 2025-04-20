import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Lendist Dashboard</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/" className="block p-2 rounded hover:bg-gray-200">Dashboard</Link>
            </li>
            <li>
              <Link to="/borrowers" className="block p-2 rounded hover:bg-gray-200">Borrowers</Link>
            </li>
            <li>
              <Link to="/loans" className="block p-2 rounded hover:bg-gray-200">Loans</Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 sticky top-0">
          <h2 className="text-lg font-semibold">Lendist Management System</h2>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 