import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';
import { Province, ProvinceScore } from '@/types';
import { useProvinces } from '@/hooks/useBackendData';
import { useMapFiltering } from '@/hooks/useMapFiltering';
import { getSentimentColorWithAlpha } from '@/utils/sentimentUtils';
import turkeyGeoJSON from '@/frontend_data/tr-cities-utf8.json';

const SENTIMENT_COLORS = {
  positive: 'text-[hsl(var(--sentiment-positive))]',
  neutral: 'text-[hsl(var(--primary)/0.8)]',
  negative: 'text-[hsl(var(--sentiment-negative))]'
};

interface TurkeyMapProps {
  onProvinceClick: (province: Province) => void;
  selectedProvince?: string | null;
  comparisonMode: boolean;
  selectedProvinces: string[];
  activeFilters?: {
    hashtags: string[];
    sentiment: string[];
    regions: string[];
  };
  provinces: Province[];
  hashtagScores: ProvinceScore[];
  isFiltering: boolean;
}

export const TurkeyMap: React.FC<TurkeyMapProps> = ({
  onProvinceClick,
  selectedProvince,
  comparisonMode,
  selectedProvinces,
  activeFilters,
  provinces,
  hashtagScores,
  isFiltering,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const resolvedColors = useRef<{ primary: string; glow: string; foreground: string; background: string; border: string; }>({ primary: '', glow: '', foreground: '', background: '', border: '' });
  
  // Use backend data if available, fallback to local data
  const displayProvinces = provinces
  
  // Use the new filtering system
  const { getFilterMatch } = useMapFiltering(displayProvinces, hashtagScores, activeFilters);

  const [currentTheme, setCurrentTheme] = useState(
    document.documentElement.classList.contains('light') ? 'light' : 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCurrentTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Create a robust mapping between GeoJSON province names and backend province IDs
  const createProvinceNameMapping = useCallback(() => {
    const nameToIdMap = new Map<string, string>();
    
    displayProvinces.forEach(province => {
      // Add direct name mapping
      nameToIdMap.set(province.name, province.id);
      nameToIdMap.set(province.name.toLowerCase(), province.id);
      
      // Add normalized versions (remove Turkish characters)
      const normalized = province.name
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ğ/g, 'G')
        .replace(/Ü/g, 'U')
        .replace(/Ş/g, 'S')
        .replace(/İ/g, 'I')
        .replace(/Ö/g, 'O')
        .replace(/Ç/g, 'C');
      
      nameToIdMap.set(normalized, province.id);
      nameToIdMap.set(normalized.toLowerCase(), province.id);
      
      // Handle specific problematic names
      if (province.name === 'Gümüşhane') {
        nameToIdMap.set('Gumushane', province.id);
        nameToIdMap.set('gumushane', province.id);
      }
      if (province.name === 'Afyonkarahisar') {
        nameToIdMap.set('Afyon', province.id);
        nameToIdMap.set('afyon', province.id);
      }
    });
    
    return nameToIdMap;
  }, [displayProvinces]);

  // Function to find province by GeoJSON name
  const findProvinceByGeoJSONName = useCallback((geoJSONName: string): Province | null => {
    const nameMapping = createProvinceNameMapping();
    
    // Try exact match first
    let provinceId = nameMapping.get(geoJSONName);
    if (provinceId) {
      return displayProvinces.find(p => p.id === provinceId) || null;
    }
    
    // Try lowercase match
    provinceId = nameMapping.get(geoJSONName.toLowerCase());
    if (provinceId) {
      return displayProvinces.find(p => p.id === provinceId) || null;
    }
    
    // Try partial matches for complex names
    for (const [mappedName, id] of nameMapping.entries()) {
      if (mappedName.includes(geoJSONName.toLowerCase()) || geoJSONName.toLowerCase().includes(mappedName)) {
        return displayProvinces.find(p => p.id === id) || null;
      }
    }
    
    return null;
  }, [displayProvinces, createProvinceNameMapping]);

  const handleProvinceClick = useCallback((province: Province) => {
    console.log('Clicking province:', province.name, 'Backend ID:', province.id);
    onProvinceClick(province);
  }, [onProvinceClick]);
  
  const defaultFillColor = currentTheme === 'light' ? 'hsla(100, 0%, 95%, 1)' : 'hsla(220, 15%, 20%, 1)';
  const defaultBorderColor = currentTheme !== 'light' ? 'hsla(100, 0%, 95%, 1)' : 'hsla(220, 15%, 20%, 1)';

  const getProvinceFillColor = (provinceId: string) => {
    const primaryColor = `hsl(${resolvedColors.current.primary})`;
    const glow = `hsl(${resolvedColors.current.glow})`;
    
    // ✅ Use a dynamic muted color

    const province = displayProvinces.find(p => p.id === provinceId);
    if (!province) return glow;

    // Selection states still have the highest priority.
    if (selectedProvinces.includes(provinceId) || selectedProvince === provinceId) {
      return glow;
    }
    
    // Check if any filters are active at all.
    const hasActiveFilters = activeFilters && (activeFilters.hashtags.length > 0 || activeFilters.sentiment.length > 0 || activeFilters.regions.length > 0);
  
    if (hasActiveFilters) {
      const matchResult = getFilterMatch(provinceId);

      // If a province doesn't match the restrictive filters, hide it.
      if (!matchResult.isVisible) {
        return defaultFillColor;
      }

      // ✅ SOLUTION: Check specifically for an active HASHTAG filter
      const hasActiveHashtagFilter = activeFilters.hashtags.length > 0;

      if (hasActiveHashtagFilter) {
        // If a hashtag filter is on, apply the thematic blue shade based on score.
        const lightness = 40 + (40 * (1-matchResult.score));
        return `hsl(220, 80%, ${lightness}%)`;
      } else {
        // If it's visible but only due to region/sentiment filters,
        // use a solid highlight color.
        return primaryColor;
      }
    }
  
    // If no filters are active at all, return the default muted color.
    return defaultFillColor;
  };

  // Initialize map

  useEffect(() => {
    if (!mapContainer.current) return;

    const rootStyles = getComputedStyle(document.documentElement);
    resolvedColors.current.primary = rootStyles.getPropertyValue('--primary').trim();
    resolvedColors.current.glow = rootStyles.getPropertyValue('--primary-glow').trim();
    // ✅ Read additional theme colors from CSS variables
    resolvedColors.current.foreground = rootStyles.getPropertyValue('--foreground').trim();
    resolvedColors.current.background = rootStyles.getPropertyValue('--background').trim();
    resolvedColors.current.border = rootStyles.getPropertyValue('--border').trim();
    
    // ✅ Choose the map style URL based on the current theme
    const mapStyle = currentTheme === 'light' 
      ? 'https://api.maptiler.com/maps/bright/style.json?key=oxUMfywHNA57ioYervjR'
      : 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=oxUMfywHNA57ioYervjR';

 

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle, // OpenStreetMap style
      center: [35.2433, 38.9637], // Turkey center
      zoom: 6.2, // Better zoom for Turkey
      maxBounds: [
        [24.35, 34.0], // Southwest coordinates
        [46.0, 42.8]  // Northeast coordinates
      ]
    });

    // Add GeoJSON source and layer when map loads
    map.current.on('load', () => {
      if (!map.current) return;

      // Add Turkey cities source
      map.current.addSource('turkey-cities', {
        type: 'geojson',
        data: turkeyGeoJSON as any
      });

      // Add fill layer
      map.current.addLayer({
        id: 'turkey-cities-fill',
        type: 'fill',
        source: 'turkey-cities',
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            '#6366f1',
            ['boolean', ['feature-state', 'hovered'], false],
            '#8b5cf6',
            '#e5e7eb'
          ],
          'fill-opacity': 1
        }
      });

      // Add border layer
      map.current.addLayer({
        id: 'turkey-cities-border',
        type: 'line',
        source: 'turkey-cities',
        paint: {
          'line-color': defaultBorderColor,
          'line-width': 1
        }
      });
      
      map.current.addLayer({
        id: 'polygon-label',
        type: 'symbol',
        source: 'turkey-cities',
        filter: ['==', ['geometry-type'], 'Polygon'],
        layout: {
          'text-allow-overlap': false,
          'text-field': ['get', 'name'],
          'text-size': 15,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': `hsl(${resolvedColors.current.foreground})`,
          'text-halo-color': `hsl(${resolvedColors.current.background})`,
          'text-halo-width': 1.5
        }
      });

      // Update colors based on current state
      updateMapColors();
    });

    // Click handler
    map.current.on('click', 'turkey-cities-fill', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const provinceName = feature.properties?.name;
      
      if (provinceName) {
        // Find province by matching name from GeoJSON to province data
        const province = displayProvinces.find(p => 
          p.name === provinceName || 
          p.name.toLowerCase() === provinceName.toLowerCase() ||
          // Handle potential name variations in the GeoJSON
          provinceName.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(provinceName.toLowerCase())
        );
        if (province) {
          console.log('Clicking province:', province.name, 'Backend ID:', province.id);
          handleProvinceClick(province);
        } else {
          console.warn('Province not found in backend data:', provinceName);
        }
      }
    });

    // Hover handlers with improved province detection
    map.current.on('mouseenter', 'turkey-cities-fill', (e) => {
      if (!map.current || !e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const geoJsonProvinceName = feature.properties?.name;
      
      if (geoJsonProvinceName) {
        // Use the robust province mapping to find the correct province
        const province = findProvinceByGeoJSONName(geoJsonProvinceName);
        
        if (province) {
          setHoveredProvince(province.name);
          map.current.getCanvas().style.cursor = 'pointer';
          
          if (feature.id) {
            map.current.setFeatureState(
              { source: 'turkey-cities', id: feature.id },
              { hovered: true }
            );
          }
        }
      }
    });

    map.current.on('mouseleave', 'turkey-cities-fill', () => {
      if (!map.current) return;
      
      setHoveredProvince(null);
      map.current.getCanvas().style.cursor = '';
      
      // Remove hover state from all features
      map.current.querySourceFeatures('turkey-cities').forEach(feature => {
        if (feature.id) {
          map.current!.setFeatureState(
            { source: 'turkey-cities', id: feature.id },
            { hovered: false }
          );
        }
      });
    });

    // Add mousemove handler to detect province changes while hovering
    map.current.on('mousemove', 'turkey-cities-fill', (e) => {
      if (!map.current || !e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const geoJsonProvinceName = feature.properties?.name;
      
      if (geoJsonProvinceName) {
        const province = findProvinceByGeoJSONName(geoJsonProvinceName);
        
        if (province && hoveredProvince !== province.name) {
          // Clear previous hover state
          map.current.querySourceFeatures('turkey-cities').forEach(f => {
            if (f.id) {
              map.current!.setFeatureState(
                { source: 'turkey-cities', id: f.id },
                { hovered: false }
              );
            }
          });
          
          // Set new hover state
          setHoveredProvince(province.name);
          if (feature.id) {
            map.current.setFeatureState(
              { source: 'turkey-cities', id: feature.id },
              { hovered: true }
            );
          }
        }
      }
    });

    // Track mouse position for tooltip
    map.current.on('mousemove', (e) => {
      setMousePosition({ x: e.point.x, y: e.point.y });
    });

    return () => {
      map.current?.remove();
    };
  }, [currentTheme]);

  // Function to update map colors
  const updateMapColors = useCallback(() => {
    if (!map.current || !map.current.getSource('turkey-cities')) return;

    // Update fill colors based on current state
    const fillExpression: any[] = ['case'];
    
    displayProvinces.forEach(province => {
      // ✅ SOLUTION: Add a check to make sure province and province.id exist.
      if (province && province.id) {
        const color = getProvinceFillColor(province.id);
        fillExpression.push(['==', ['get', 'name'], province.name], color);
      }
    });
    
    fillExpression.push('#e5e7eb'); // default color

    map.current.setPaintProperty('turkey-cities-fill', 'fill-color', fillExpression);
    
    // Update selected states for comparison mode
    if (map.current.getSource('turkey-cities')) {
      map.current.querySourceFeatures('turkey-cities').forEach(feature => {
        if (feature.id && feature.properties?.name) {
          const province = displayProvinces.find(p => p.name === feature.properties.name);
          if (province) {
            const isSelected = selectedProvinces.includes(province.id) || (selectedProvince === province.id && !comparisonMode);
            map.current!.setFeatureState(
              { source: 'turkey-cities', id: feature.id },
              { selected: isSelected }
            );
          }
        }
      });
    }
  }, [displayProvinces, selectedProvince, selectedProvinces, activeFilters, comparisonMode, getFilterMatch]);

  // Update map colors when dependencies change
  useEffect(() => {
    updateMapColors();
  }, [updateMapColors]);

  // Track mouse position for tooltip
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (hoveredProvince) {
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  }, [hoveredProvince]);

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[500px]" onMouseMove={handleMouseMove}>
      <div 
        ref={mapContainer} 
        className="w-full h-full min-h-[500px] rounded-lg border border-border"
        style={{ minHeight: '500px' }}
      />
      
      {/* Tooltip */}
      {hoveredProvince && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-lg p-3 shadow-xl min-w-[200px] pointer-events-none"
          style={{
            left: mousePosition.x,
            top: mousePosition.y - 120,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="space-y-1">
            {(() => {
              const province = displayProvinces.find(p => p.name === hoveredProvince);
              if (!province) return null;
              
              return (
                <>
                  <h4 className="font-semibold text-foreground">{province.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Eğilim: <span className={cn(
                      "font-medium",
                      province.inclination === 'Çok Olumlu' ?  SENTIMENT_COLORS.positive:
                      province.inclination === 'Olumlu' ? SENTIMENT_COLORS.positive :
                      province.inclination === 'Nötr' ? SENTIMENT_COLORS.neutral :
                      SENTIMENT_COLORS.negative
                    )}>{province.inclination}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Popüler: <span className="text-primary font-medium">{province.mainHashtag}</span>
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}
      
      {comparisonMode && (
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 border">
          <p className="text-sm font-medium text-primary">
            Comparison Mode: Select up to 3 cities
          </p>
          <p className="text-xs text-muted-foreground">
            {selectedProvinces.length}/3 selected
          </p>
        </div>
      )}
    </div>
  );
};

export default TurkeyMap;