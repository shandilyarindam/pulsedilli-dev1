import { NextResponse } from 'next/server';

// Generate mock GeoJSON for ~12 wards around Delhi coordinates
const wards = {
  type: 'FeatureCollection',
  features: Array.from({ length: 12 }, (_, i) => {
    const baseLat = 28.6 + (i % 3) * 0.02;
    const baseLng = 77.2 + Math.floor(i / 3) * 0.02;
    const delta = 0.008;
    return {
      type: 'Feature',
      properties: {
        wardId: `Ward-${i + 1}`,
        healthScore: Math.floor(Math.random() * 101), // 0-100
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [baseLng - delta, baseLat - delta],
          [baseLng + delta, baseLat - delta],
          [baseLng + delta, baseLat + delta],
          [baseLng - delta, baseLat + delta],
          [baseLng - delta, baseLat - delta],
        ]],
      },
    };
  }),
};

export async function GET() {
  return NextResponse.json(wards);
}
