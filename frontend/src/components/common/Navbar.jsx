import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext.jsx';
import { Sun, Moon, BarChart2, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Branding Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-md shadow-emerald-500/20">
            <BarChart2 className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-lg font-bold tracking-tight text-transparent">
            VidIQ Comparator
          </span>
        </div>

        {/* Action Menu */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Video className="h-4 w-4" />
            <span>New Compare</span>
          </Link>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:bg-accent hover:text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-emerald-400" />
            ) : (
              <Moon className="h-4 w-4 text-cyan-600" />
            )}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
