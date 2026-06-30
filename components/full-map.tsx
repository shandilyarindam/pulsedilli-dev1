"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Complaint {
  id: string;
  summary: string | null;
  category: string | null;
  status: string | null;
  urgency: string | null;
  timestamp: string | null;
  location: string | null;
  ward: string | null;
  assigned_to: string | null;
  photo_url: string | null;
}

import { useEffect, useState } from "react";
interface Props {
  complaints: Complaint[];
  onSelect: (c: Complaint) => void;
  wards?: GeoJSON.FeatureCollection;
  incidents?: { lat: number; lng: number; type?: string }[];
  showWards?: boolean;
  showIncidents?: boolean;
}

const URGENCY_CLR: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const CAT_CLR: Record<string, string> = {
  "Waste Management": "#84cc16",
  "Water Supply": "#3b82f6",
  Roads: "#a855f7",
  "Sewage & Drainage": "#f97316",
  Electricity: "#eab308",
  Other: "#6b7280",
};

function parseLatLng(loc: string | null): [number, number] | null {
  if (!loc) return null;
  const parts = loc.split(",").map((s) => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return [parts[0], parts[1]];
  }
  return null;
}

export default function FullMap({ complaints, onSelect, wards, incidents, showWards, showIncidents }: Props) {
  const markers = complaints
    .map((c) => ({ ...c, latlng: parseLatLng(c.location) }))
    .filter((c) => c.latlng !== null);

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={11}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />


  // Render ward boundaries if enabled
  {showWards && wards && (
    <GeoJSON
      data={wards}
      style={(feature) => {
        const score = feature?.properties?.healthScore ?? 0;
        let fillColor = '#10b981'; // green default (healthy)
        if (score <= 40) fillColor = '#ef4444'; // red critical
        else if (score <= 60) fillColor = '#f97316'; // orange concern
        else if (score <= 80) fillColor = '#facc15'; // yellow watchlist
        return { color: '#000', weight: 1, fillColor, fillOpacity: 0.4 };
      }}
      onEachFeature={(feature, layer) => {
        const name = feature.properties?.wardId ?? 'Ward';
        const score = feature?.properties?.healthScore ?? 0;
        layer.bindPopup(`${name}<br/>Health Score: ${score}`);
        layer.on('click', () => {
          const map = (layer as any)._map;
          // Retrieve bounds if available (Polygon/Polyline)
          const bounds = (layer as any).getBounds?.();
          if (bounds && map) {
            map.fitBounds(bounds);
          }
        });
      }}
    />
  )}

  // Render CCTV/incident markers if enabled
  {showIncidents && incidents && incidents.map((inc, idx) => (
    <Marker key={idx} position={[inc.lat, inc.lng]} />
  ))}
    </MapContainer>
  );
}
