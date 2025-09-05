import React from 'react';
import { cn } from '@/lib/utils';
import { Province } from '@/types';
import { getSentimentColor } from '@/utils/sentimentUtils';

interface MapTooltipProps {
  province: Province;
  position: { x: number; y: number };
  className?: string;
}

export const MapTooltip: React.FC<MapTooltipProps> = ({ 
  province, 
  position, 
  className 
}) => {
  return (
    <div
      className={cn(
        "fixed z-50 bg-popover border border-border rounded-lg p-3 shadow-xl min-w-[200px] pointer-events-none",
        className
      )}
      style={{
        left: position.x,
        top: position.y - 120,
        transform: 'translateX(-50%)',
      }}
    >
      <div className="space-y-1">
        <h4 className="font-semibold text-foreground">{province.name}</h4>
        <p className="text-sm text-muted-foreground">
          Eğilim: <span 
            className="font-medium"
            style={{ color: getSentimentColor(province.inclination) }}
          >
            {province.inclination}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Popüler: <span className="text-primary font-medium">{province.mainHashtag}</span>
        </p>
      </div>
    </div>
  );
};