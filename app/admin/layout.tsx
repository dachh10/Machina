'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Hammer, LayoutDashboard, Package, MessageSquare, Settings, LogOut, Users, Menu, X, FolderKanban, User, ChevronDown, Monitor } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/categorias', label: 'Categorías', icon: FolderKanban },
  { href: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userNombre, setUserNombre] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('machina_user');
    if (pathname === '/admin/setup') {
      setIsAuthorized(true);
      return;
    }
    if (!userStr) {
      router.replace('/login');
    } else {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          router.replace('/');
        } else {
          setUserNombre(user.nombre || 'Admin');
          setUserEmail(user.email || 'admin@machina.mx');
          setIsAuthorized(true);
        }
      } catch {
        router.replace('/login');
      }
    }
  }, [router, pathname]);

  // Handle clicking outside of profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      localStorage.removeItem('machina_user');
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setLoggingOut(false);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FFC107]/30 border-t-[#FFC107] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      {/* Admin Navbar - Mismo diseño que el cliente */}
      <nav className="bg-dark-900/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 bg-noise">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/admin" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(255,193,7,0.3)]">
                <div className="absolute inset-0 bg-metal opacity-50"></div>
                <Hammer className="w-6 h-6 text-dark-900 relative z-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tighter leading-none">
                  MACHINA
                </span>
                <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase leading-none mt-1">
                  Admin Panel
                </span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200 border border-transparent",
                        isActive
                          ? "text-primary bg-white/5 border-white/10 shadow-inner"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">{userNombre || 'Usuario'}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 text-gray-500", isProfileOpen && "rotate-180 text-white")} />
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden animate-fade-in-up origin-top-right backdrop-blur-xl">
                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cuenta</p>
                      <p className="text-sm text-white truncate">{userEmail}</p>
                    </div>

                    <Link 
                      href="/"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-primary hover:bg-white/5 transition-colors"
                    >
                      <Monitor className="w-4 h-4" /> Vista Cliente
                    </Link>
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      {loggingOut ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-dark-900 border-t border-dark-700 bg-noise">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-3 rounded-md text-base font-medium flex items-center gap-2",
                    pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
                      ? "text-primary bg-white/5"
                      : "text-gray-300 hover:text-primary hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-white/10 mt-4 pt-4 pb-2 space-y-2">
                <div className="px-3 py-3 flex items-center gap-3 border-b border-white/5 mb-2">
                  <div className="w-10 h-10 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-white font-bold">{userNombre || 'Usuario'}</div>
                    <div className="text-gray-500 text-xs">{userEmail || 'Admin'}</div>
                  </div>
                </div>

                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-primary hover:bg-white/5"
                >
                  <Monitor className="w-5 h-5" /> Vista Cliente
                </Link>
                
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10 text-left"
                >
                  {loggingOut ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}