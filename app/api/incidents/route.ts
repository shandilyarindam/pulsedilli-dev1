import { NextResponse } from 'next/server';

// Mock incident data: random points within Delhi area
const incidents = Array.from({ length: 8 }, (_, i) => {
  const baseLat = 28.6 + Math.random() * 0.1 - 0.05;
  const baseLng = 77.2 + Math.random() * 0.1 - 0.05;
  return {
    id: `inc-${i + 1}`,
    type: 'CCTV',
    latitude: baseLat,
    longitude: baseLng,
    description: 'Mock incident detection',
  };
});

export async function GET() {
  return NextResponse.json(incidents);
}
