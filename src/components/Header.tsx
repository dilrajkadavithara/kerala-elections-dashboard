'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, BarChart3 } from 'lucide-react';
import { NAV_LINKS } from '@/lib/constants';

interface HeaderProps {
  constituencyNames: { id: number; name: string; district: string }[];
}

export default function Header({ constituencyNames }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filtered = searchQuery.length >= 2
    ? constituencyNames.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.district.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BarChart3 size={22} className="text-blue-600" />
            <span className="font-heading font-bold text-base text-stone-900 hidden sm:block">
              Kerala Elections
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-stone-100 text-stone-900'
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-1 bg-stone-100 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-stone-400" />
              <input
                type="text"
                placeholder="Search constituency..."
                className="bg-transparent text-sm text-stone-700 placeholder:text-stone-400 outline-none w-36 sm:w-48"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
            </div>
            {searchOpen && filtered.length > 0 && (
              <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
                {filtered.map((c) => (
                  <Link
                    key={c.id}
                    href={`/constituency/${c.id}`}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 transition-colors"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <span className="text-sm font-medium text-stone-800">{c.name}</span>
                    <span className="text-xs text-stone-400">{c.district}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 text-stone-500 hover:text-stone-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-stone-100 bg-white px-4 py-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-500 hover:bg-stone-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
