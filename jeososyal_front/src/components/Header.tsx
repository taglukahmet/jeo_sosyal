import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Globe, BarChart3, Info, Moon, Sun, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onNationalAgendaClick: () => void;
  onAboutClick: () => void;
  comparisonMode: boolean;
  onComparisonToggle: () => void;
  showNationalPanel: boolean;
  onFilterToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNationalAgendaClick,
  onAboutClick,
  comparisonMode,
  onComparisonToggle,
  showNationalPanel,
  onFilterToggle
}) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'light' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  }, [isDark]);


  const toggleTheme = () => {
    setIsDark(prevIsDark => !prevIsDark);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center glow-effect">
            <Globe className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              JeoSosyal
            </h1>
            <p className="text-xs text-muted-foreground">
              JeoPolitik Analiz Platformu
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {/* Theme Switch */}
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-primary"
            />
            <Sun className="h-4 w-4 text-muted-foreground" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFilterToggle}
            className="transition-all duration-300"
          >
            <Search className="w-4 h-4 mr-2" />
            Filtrele
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/comparison')}
            className="transition-all duration-300"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Karşılaştırma
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNationalAgendaClick}
            className={cn(
              "transition-all duration-300",
              showNationalPanel && "bg-primary/20 text-primary hover:bg-primary/30"
            )}
          >
            <Globe className="w-4 h-4 mr-2" />
            Ulusal Gündem
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onAboutClick}
          >
            <Info className="w-4 h-4 mr-2" />
            Hakkında
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;