import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useAuthStore } from '@features/auth/model/auth-store';
import { useThemeStore } from '@shared/lib/theme-store';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';

const NAV_LINK_CLASS = 'text-muted-foreground [&.active]:font-medium [&.active]:text-foreground';

export function AppLayout() {
  const navigate = useNavigate();
  const email = useAuthStore((state) => state.user?.email);
  const logout = useAuthStore((state) => state.logout);
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  function handleLogout() {
    logout();
    navigate({ to: '/login' });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/search" className="font-display text-xl font-semibold">
            Libris
          </Link>
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            <Link to="/search" className={NAV_LINK_CLASS}>
              Buscar
            </Link>
            <Link to="/shelf" className={NAV_LINK_CLASS}>
              Estante
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {email && <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Abrir navegação" className="sm:hidden">
                <MenuIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/search">Buscar</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/shelf">Estante</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Alternar tema"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
