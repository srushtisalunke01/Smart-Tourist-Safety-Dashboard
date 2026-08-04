import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Eye } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../context/ThemeContext';

// Fix Leaflet default icon issues in React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent({ center = [26.9239, 75.8267], zoom = 14 }) {
  const { zones, scams, hotspots, activeSOS, attractions } = useAppStore();
  const { theme } = useTheme();
  
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  
  const layersGroupRef = useRef(L.layerGroup());
  const userMarkerRef = useRef(null);

  const createCustomIcon = (color) => {
    return L.divIcon({
      html: `
        <div style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 2px 5px rgba(0,0,0,0.5))">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
          </svg>
        </div>
      `,
      className: 'custom-marker-svg',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const current = [pos.coords.latitude, pos.coords.longitude];
          setUserCoords(current);
          if (map) {
            map.setView(current, map.getZoom());
          }
        },
        (err) => {
          console.warn('Geolocation query blocked. Defaulting to center coordinates.', err);
          setUserCoords(center);
        },
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setUserCoords(center);
    }
  }, [map, center]);

  // Init Map
  useEffect(() => {
    if (mapContainerRef.current && !map) {
      const mapInstance = L.map(mapContainerRef.current, {
        zoomControl: false, 
        attributionControl: false
      }).setView(center, zoom);

      L.control.zoom({ position: 'topright' }).addTo(mapInstance);
      layersGroupRef.current.addTo(mapInstance);
      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    }
  }, []);

  // Update map tiles
  useEffect(() => {
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; 

    L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: 'abcd'
    }).addTo(map);

  }, [map, theme]);

  // Update markers and circles
  useEffect(() => {
    if (!map) return;

    layersGroupRef.current.clearLayers();

    if (userCoords) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      
      const customUserIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: #22c55e; opacity: 0.4;" class="animate-ping"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #22c55e; border: 2px solid white; box-shadow: 0px 0px 6px rgba(0,0,0,0.3)"></div>
          </div>
        `,
        className: 'user-pulse-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      userMarkerRef.current = L.marker(userCoords, { icon: customUserIcon })
        .addTo(map)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px; font-size: 11px;">
            <h5 style="margin: 0 0 2px 0; font-weight: bold; color: #22c55e;">📍 Your Location</h5>
            <p style="margin: 0; color: #64748b; font-size: 9px;">GPS tracked coordinates</p>
          </div>
        `);
    }

    // A. Geofence zones
    zones.forEach(zone => {
      const color = zone.safetyScore >= 80 ? '#22c55e' : zone.safetyScore >= 55 ? '#eab308' : '#ef4444';
      
      L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 1.5,
        radius: zone.radius || 1000
      }).addTo(layersGroupRef.current);

      L.marker([zone.lat, zone.lng], { icon: createCustomIcon(color) })
        .addTo(layersGroupRef.current)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px; font-size: 11px; line-height: 1.4;">
            <h5 style="margin: 0 0 4px 0; font-weight: bold; color: #1e1b4b;">🛡️ ${zone.name}</h5>
            <p style="margin: 0 0 4px 0; color: #475569;">${zone.advisory}</p>
            <span style="background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-size: 9px; font-weight: bold; border: 1px solid #e2e8f0;">Score: ${zone.safetyScore}/100</span>
          </div>
        `);
    });

    // B. Scam incidents
    scams.forEach(scam => {
      L.marker([scam.lat, scam.lng], { icon: createCustomIcon('#eab308') })
        .addTo(layersGroupRef.current)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px; font-size: 11px; line-height: 1.4; max-width: 200px;">
            <span style="background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; font-weight: bold; padding: 2px 4px; border-radius: 4px; font-size: 8px; text-transform: uppercase;">${scam.category}</span>
            <p style="margin: 6px 0 4px 0; color: #1e293b; font-weight: bold;">${scam.description}</p>
            <p style="margin: 0; color: #64748b; font-size: 9px;">📍 Location: ${scam.address}</p>
          </div>
        `);
    });

    // C. AI Hotspots
    hotspots.forEach(hs => {
      L.circle([hs.lat, hs.lng], {
        color: '#eab308',
        fillColor: '#eab308',
        fillOpacity: 0.18,
        weight: 1,
        radius: hs.radius || 300
      }).addTo(layersGroupRef.current);

      L.marker([hs.lat, hs.lng], { icon: createCustomIcon('#eab308') })
        .addTo(layersGroupRef.current)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px; font-size: 11px; line-height: 1.4;">
            <h5 style="margin: 0 0 2px 0; font-weight: bold; color: #ca8a04;">✨ AI SCAM RADAR</h5>
            <p style="margin: 0; color: #475569;">${hs.advisory}</p>
          </div>
        `);
    });

    // D. Active SOS
    activeSOS.forEach(sos => {
      L.circle([sos.lat, sos.lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.3,
        weight: 1.5,
        radius: 400
      }).addTo(layersGroupRef.current);

      L.marker([sos.lat, sos.lng], { icon: createCustomIcon('#ef4444') })
        .addTo(layersGroupRef.current)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px; font-size: 11px; line-height: 1.4;">
            <h5 style="margin: 0 0 4px 0; font-weight: 850; color: #ef4444;">🚨 EMERGENCY SOS ACTIVE</h5>
            <p style="margin: 0; color: #1e293b; font-weight: bold;">User: ${sos.user?.name || 'Tourist'}</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 9px;">Phone: ${sos.user?.phone || 'N/A'}</p>
          </div>
        `);
    });

    // E. Attractions
    attractions.forEach(spot => {
      L.marker([spot.lat, spot.lng], { icon: createCustomIcon('#8b5cf6') })
        .addTo(layersGroupRef.current)
        .bindPopup(`
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px; font-size: 11px; line-height: 1.4;">
            <h5 style="margin: 0 0 2px 0; font-weight: bold; color: #8b5cf6;">🏛️ ${spot.name}</h5>
            <p style="margin: 0 0 4px 0; color: #475569; font-size: 10px;">${spot.description}</p>
            <span style="color: #059669; font-weight: bold; font-size: 9px;">Eco score: ${spot.ecoScore}/10</span>
          </div>
        `);
    });

  }, [map, userCoords, zones, scams, hotspots, activeSOS, attractions]);

  return (
    <div className="relative w-full h-[500px] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-900 z-0">
      
      {/* Map Control Info Overlay Panel */}
      <div className="absolute bottom-4 left-4 z-[999] p-4 rounded-xl border border-slate-200 dark:border-white/10 text-xs flex flex-col gap-2 shadow-2xl max-w-sm bg-white/95 dark:bg-slate-900/95 dark:text-slate-100 text-slate-800">
        <h4 className="font-bold text-sm flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-1 text-slate-800 dark:text-slate-100">
          <Eye className="w-4 h-4 text-brand-500" />
          Live Safety Overlays
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-350 font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Safe Zone (&gt;80)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            Caution Zone (55-80)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            High Risk (&lt;55)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            Attractions
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
    </div>
  );
}
