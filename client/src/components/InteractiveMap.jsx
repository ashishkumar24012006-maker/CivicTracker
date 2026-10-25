import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, MapPin } from 'lucide-react';

// Color map for issue statuses
const statusColors = {
  'Submitted': '#3b82f6',     // Blue
  'Under Review': '#a855f7',  // Purple
  'Assigned': '#6366f1',      // Indigo
  'In Progress': '#f59e0b',   // Amber
  'Resolved': '#14b8a6',      // Teal
  'Verified': '#10b981',      // Emerald
  'Reopened': '#f43f5e',      // Rose
  'Rejected': '#64748b',      // Slate
};

// Create custom SVG colored pins for Leaflet
const createPinIcon = (status, category) => {
  const color = statusColors[status] || '#14b8a6';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" 
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="12" cy="12" r="5" fill="#ffffff" />
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-map-pin',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
};

const pickerPinIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="34" height="46">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12z" fill="#f43f5e"/>
      <circle cx="12" cy="12" r="6" fill="#ffffff" />
      <circle cx="12" cy="12" r="3" fill="#f43f5e" />
    </svg>
  `,
  className: 'custom-picker-pin',
  iconSize: [34, 46],
  iconAnchor: [17, 46],
});

export default function InteractiveMap({
  reports = [],
  selectedReport = null,
  onSelectReport = null,
  pickerLocation = null,
  onLocationSelect = null,
  height = '500px',
  center = [28.6139, 77.2090],
  zoom = 13,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Layer group for reports
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // Click event for location selection if allowed
      map.on('click', (e) => {
        if (onLocationSelect) {
          const { lat, lng } = e.latlng;
          onLocationSelect({ lat, lng });
        }
      });

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if needed
    };
  }, []);

  // Update report markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    reports.forEach((report) => {
      if (!report.location || !report.location.coordinates) return;
      const [lng, lat] = report.location.coordinates;

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng], {
        icon: createPinIcon(report.status, report.category),
      });

      const imgHtml = report.images && report.images.length > 0
        ? `<img src="${report.images[0].url}" alt="${report.title}" class="w-full h-24 object-cover rounded-md mb-2" />`
        : '';

      const popupContent = `
        <div style="font-family: inherit; width: 230px;" class="p-1">
          ${imgHtml}
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #0d9488; margin-bottom: 2px;">
            ${report.category || 'Civic Issue'}
          </div>
          <h4 style="font-weight: 700; font-size: 13px; color: #0f172a; line-height: 1.25; margin-bottom: 4px;">
            ${report.title}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${report.address || ''}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 9999px; background: #f1f5f9; color: #334155;">
              ${report.status}
            </span>
            <span style="font-size: 10px; font-weight: 600; color: ${report.priority === 'Critical' ? '#e11d48' : '#d97706'};">
              ${report.priority}
            </span>
          </div>
          <button id="view-report-btn-${report._id}" style="width: 100%; background: #0f172a; color: #ffffff; border: none; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
            View Full Report &rarr;
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-report-btn-${report._id}`);
        if (btn && onSelectReport) {
          btn.onclick = () => onSelectReport(report._id);
        }
      });

      marker.addTo(layer);
    });

    // Auto-fit bounds if reports exist
    if (reports.length > 0 && mapInstanceRef.current) {
      const validPoints = reports
        .filter((r) => r.location && r.location.coordinates)
        .map((r) => [r.location.coordinates[1], r.location.coordinates[0]]);
      if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [reports, onSelectReport]);

  // Update picker location pin
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (pickerMarkerRef.current) {
      map.removeLayer(pickerMarkerRef.current);
      pickerMarkerRef.current = null;
    }

    if (pickerLocation && pickerLocation.lat && pickerLocation.lng) {
      const marker = L.marker([pickerLocation.lat, pickerLocation.lng], {
        icon: pickerPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        }
      });

      marker.bindPopup('<b style="font-size: 12px;">Selected Issue Location</b><br/><span style="font-size: 10px; color: #64748b;">Drag pin to fine-tune exact spot</span>').openPopup();

      pickerMarkerRef.current = marker;
      map.setView([pickerLocation.lat, pickerLocation.lng], 15);
    }
  }, [pickerLocation, onLocationSelect]);

  const handleLocateMe = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.setView([latitude, longitude], 15);
        if (onLocationSelect) {
          onLocationSelect({ lat: latitude, lng: longitude });
        }
      },
      (err) => {
        alert('Could not retrieve your GPS location. Please allow location permissions.');
      }
    );
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Control: Locate Me Button */}
      <button
        onClick={handleLocateMe}
        className="absolute bottom-4 right-4 z-[400] bg-white hover:bg-slate-50 text-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
        title="Use my current GPS location"
      >
        <MapPin className="w-4 h-4 text-teal-600" />
        <span>My Location</span>
      </button>
    </div>
  );
}
