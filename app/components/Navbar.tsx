'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, Hammer, LogOut, User, ChevronDown, LayoutDashboard, Monitor } from 'lucide-react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const getUserData = () => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('machina_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  const userData = getUserData();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('machina_user');
    router.push('/');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Nosotros', path: '/about' },
    { name: 'Catálogo', path: '/catalog' },
    { name: 'Servicios', path: '/services' },
    { name: 'Contacto', path: '/contact' },
  ];

  const showNavLinks = pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password';
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  return (
    <nav className="bg-dark-900/90 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 bg-noise">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(255,193,7,0.3)]">
              <div className="absolute inset-0 bg-metal opacity-50"></div>
              <Hammer className="w-6 h-6 text-dark-900 relative z-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-tighter leading-none">
                MACHINA
              </span>
              <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase leading-none mt-1">
                Heavy Machinery
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          {showNavLinks && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.path}
                    className={cn(
                      "px-4 py-2 rounded-sm text-sm font-medium transition-all duration-200 border border-transparent",
                      pathname === link.path
                        ? "text-primary bg-white/5 border-white/10 shadow-inner"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Icons */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && userData ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">{userData.nombre || 'Usuario'}</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-300 text-gray-500", isProfileOpen && "rotate-180 text-white")} />
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] py-2 z-50 overflow-hidden animate-fade-in-up origin-top-right backdrop-blur-xl">
                    <div className="px-4 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cuenta</p>
                      <p className="text-sm text-white truncate">{userData.email || 'Admin'}</p>
                    </div>

                    {userData.isAdmin && (
                      <Link 
                        href={pathname.startsWith('/admin') ? "/" : "/admin"}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-primary hover:bg-white/5 transition-colors"
                      >
                        {pathname.startsWith('/admin') ? (
                          <><Monitor className="w-4 h-4" /> Vista Cliente</>
                        ) : (
                          <><LayoutDashboard className="w-4 h-4" /> Panel Administrador</>
                        )}
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {showNavLinks && (
                  <>
                    <button className="text-gray-400 hover:text-primary transition-colors p-2 hover:bg-white/5 rounded-full">
                      <Search className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-white/10 mx-1"></div>
                  </>
                )}
                {pathname === '/login' ? (
                  <Link 
                    href="/register" 
                    className="text-white font-medium text-sm transition-colors border border-white/10 px-4 py-2 rounded-sm hover:bg-white/5"
                  >
                    Registrarse
                  </Link>
                ) : pathname === '/register' ? (
                  <Link 
                    href="/login" 
                    className="text-gray-400 hover:text-white font-medium text-sm transition-colors px-3 py-2 rounded-sm hover:bg-white/5"
                  >
                    Iniciar Sesión
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-gray-400 hover:text-white font-medium text-sm transition-colors px-3 py-2 rounded-sm hover:bg-white/5"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      href="/register" 
                      className="text-white font-medium text-sm transition-colors border border-white/10 px-4 py-2 rounded-sm hover:bg-white/5"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </>
            )}
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
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-3 rounded-md text-base font-medium",
                  pathname === link.path
                    ? "text-primary bg-white/5"
                    : "text-gray-300 hover:text-primary hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-white/10 mt-4 pt-4 pb-2 space-y-2">
              {!loading && userData ? (
                <>
                  <div className="px-3 py-3 flex items-center gap-3 border-b border-white/5 mb-2">
                    <div className="w-10 h-10 rounded-full bg-dark-950 border border-white/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-white font-bold">{userData.nombre || 'Usuario'}</div>
                      <div className="text-gray-500 text-xs">{userData.email || 'Admin'}</div>
                    </div>
                  </div>

                  {userData.isAdmin && (
                    <Link
                      href={pathname.startsWith('/admin') ? "/" : "/admin"}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-primary hover:bg-white/5"
                    >
                      {pathname.startsWith('/admin') ? (
                        <><Monitor className="w-5 h-5" /> Vista Cliente</>
                      ) : (
                        <><LayoutDashboard className="w-5 h-5" /> Panel Administrador</>
                      )}
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10 text-left"
                  >
                    <LogOut className="w-5 h-5" /> Cerrar Sesión
                  </button>
                </>
              ) : pathname === '/login' ? (
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-dark-900 bg-primary hover:bg-primary-hover text-center"
                >
                  Registrarse
                </Link>
              ) : pathname === '/register' ? (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Iniciar Sesión
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-3 rounded-md text-base font-medium text-dark-900 bg-primary hover:bg-primary-hover text-center"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}