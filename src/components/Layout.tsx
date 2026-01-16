import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, BarChart3, FileText } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">BoardDoctor</span>
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="w-5 h-5 mr-2" />
                Accueil
              </Link>
              <Link
                to="/history"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/history') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <History className="w-5 h-5 mr-2" />
                Historique
              </Link>
              <Link
                to="/statistics"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/statistics') 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Statistiques
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}