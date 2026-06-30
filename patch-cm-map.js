/**
 * patch-cm-map.js  (CRLF-safe version)
 * Normalises line endings to LF before matching, applies patches, then
 * writes back with the original line ending style.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'components/cm-map.tsx');
const raw = fs.readFileSync(filePath);
const hasCRLF = raw.includes(Buffer.from('\r\n'));

// Work with LF-only for reliable string matching
let src = raw.toString('utf8').replace(/\r\n/g, '\n');

let changed = 0;

function patch(label, search, replacement) {
  if (src.includes(search)) {
    src = src.replace(search, replacement);
    console.log(`✓ ${label}`);
    changed++;
  } else {
    console.warn(`✗ SKIPPED (not found): ${label}`);
  }
}

// ── PATCH 1: Replace mock feature generator with Supabase fetch ─────────────
patch('Supabase fetch replaces mock generator',
`  const features = [];
  let count = 0;
  
  const categories = [
  "Unauthorized Colony Issues", "Police/Public Order", "Cantonment Area",
  "Power Regulatory", "Food & Rations/PDS", "Environment Complaints",
  "Roads & Streetlights", "Garbage & Sanitation", "Waterlogging",
  "Stray Animals", "Parks", "Property Tax", "Water Supply & Sewage [DJB]"
  ];
  const statuses = ['Pending', 'In Progress', 'Resolved'];

  // Strictly generate 50 mock complaints over Delhi
  while (count < 50) {
  const lng = 76.85 + Math.random() * (77.3 - 76.85);
  const lat = 28.45 + Math.random() * (28.85 - 28.45);
  const pt = turf.point([lng, lat]);
  
  let isInside = false;
  for (const feature of enrichedDistricts.features) {
  if (turf.booleanPointInPolygon(pt, feature)) {
  isInside = true;
  break;
  }
  }
  if (!isInside) continue;

  const cat = categories[Math.floor(Math.random() * categories.length)];
  let tier = "Layer 3: Municipal Bodies [MCD/NDMC]";
  for (const [t, cats] of Object.entries(ACCOUNTABILITY_SCHEMA)) {
  if (cats.includes(cat)) { tier = t; break; }
  }

  features.push({
  type: "Feature",
  properties: { 
  id: count,
  status: statuses[Math.floor(Math.random() * statuses.length)],
  severity: count % 3 === 0 ? 'SEVERE - Unresolved' : 'Moderate',
  location: 'Constituency ' + ((count % 70) + 1) + ', Delhi',
  daysOpen: (count % 15) + 1,
  category: cat,
  layer_tier: tier
  },
  geometry: { type: "Point", coordinates: [lng, lat] }
  });
  count++;
  }`,
`  // Fetch from Supabase — unresolved complaints, paginated to first 1,000
  const { data: supaData, error: supaError } = await supabase
    .from('complaints')
    .select('id, title, status, severity, city, created_at, latitude, longitude, categories(name, department)')
    .neq('status', 'resolved')
    .order('created_at', { ascending: false })
    .range(0, 999);

  const dbFeatures: any[] = [];
  if (supaData && !supaError) {
    for (const c of supaData) {
      const lat = (c as any).latitude ?? (28.45 + Math.random() * (28.85 - 28.45));
      const lng = (c as any).longitude ?? (76.85 + Math.random() * (77.3 - 76.85));
      const cat = ((c as any).categories as any)?.name || 'General';
      let tier = 'Layer 3: Municipal Bodies [MCD/NDMC]';
      for (const [t, cats] of Object.entries(ACCOUNTABILITY_SCHEMA)) {
        if ((cats as string[]).includes(cat)) { tier = t; break; }
      }
      const sev = (c as any).severity?.toLowerCase() || 'low';
      const urgencyLevel = sev === 'critical' ? 'L4' : sev === 'high' ? 'L3' : sev === 'medium' ? 'L2' : 'L1';
      dbFeatures.push({
        type: 'Feature',
        properties: {
          id: (c as any).id,
          summary: (c as any).title || 'Untitled Complaint',
          status: (c as any).status,
          severity: sev,
          urgencyLevel,
          location: (c as any).city || 'Delhi',
          daysOpen: Math.ceil((Date.now() - new Date((c as any).created_at).getTime()) / 86400000),
          category: cat,
          layer_tier: tier,
        },
        geometry: { type: 'Point', coordinates: [lng, lat] },
      });
    }
  }

  // Fallback: 50 mock points if DB is empty
  if (dbFeatures.length === 0) {
    const categories = [
      "Unauthorized Colony Issues", "Police/Public Order", "Cantonment Area",
      "Power Regulatory", "Food & Rations/PDS", "Environment Complaints",
      "Roads & Streetlights", "Garbage & Sanitation", "Waterlogging",
      "Stray Animals", "Parks", "Property Tax", "Water Supply & Sewage [DJB]"
    ];
    let count = 0;
    while (count < 50) {
      const lng = 76.85 + Math.random() * (77.3 - 76.85);
      const lat = 28.45 + Math.random() * (28.85 - 28.45);
      const pt = turf.point([lng, lat]);
      let isInside = false;
      for (const feature of enrichedDistricts.features) {
        if (turf.booleanPointInPolygon(pt, feature)) { isInside = true; break; }
      }
      if (!isInside) continue;
      const cat = categories[Math.floor(Math.random() * categories.length)];
      let tier = 'Layer 3: Municipal Bodies [MCD/NDMC]';
      for (const [t, cats] of Object.entries(ACCOUNTABILITY_SCHEMA)) {
        if ((cats as string[]).includes(cat)) { tier = t; break; }
      }
      const lvl = count % 4;
      const urgencyLevel = lvl === 0 ? 'L4' : lvl === 1 ? 'L3' : lvl === 2 ? 'L2' : 'L1';
      dbFeatures.push({
        type: 'Feature',
        properties: {
          id: count,
          summary: \`Mock complaint #\${count}\`,
          status: count % 2 === 0 ? 'Pending' : 'In Progress',
          severity: urgencyLevel === 'L4' ? 'critical' : urgencyLevel === 'L3' ? 'high' : urgencyLevel === 'L2' ? 'medium' : 'low',
          urgencyLevel,
          location: 'Constituency ' + ((count % 70) + 1) + ', Delhi',
          daysOpen: (count % 15) + 1,
          category: cat,
          layer_tier: tier,
        },
        geometry: { type: 'Point', coordinates: [lng, lat] },
      });
      count++;
    }
  }`
);

// ── PATCH 2: Fix setAllFeatures ──────────────────────────────────────────────
src = src.replace(/\bsetAllFeatures\(features\);/, 'setAllFeatures(dbFeatures);');
console.log('✓ setAllFeatures(dbFeatures) ensured');

// ── PATCH 3: Inject supercluster state after filter useEffect ───────────────
patch('Supercluster state + severityColor injected',
`  }, [allFeatures, filterTier, filterSeverity, filterStatus]);

  const handleMapLoad`,
`  }, [allFeatures, filterTier, filterSeverity, filterStatus]);

  // Viewport state for use-supercluster
  const [viewportBounds, setViewportBounds] = React.useState<[number, number, number, number]>([76.5, 28.3, 77.5, 28.95]);
  const [viewportZoom, setViewportZoom] = React.useState(10);

  const scPoints = React.useMemo(() => clusterData?.features ?? [], [clusterData]);

  const { clusters, supercluster } = useSupercluster({
    points: scPoints as any[],
    bounds: viewportBounds,
    zoom: viewportZoom,
    options: { radius: 75, maxZoom: 14, minPoints: 3 },
  });

  const severityColor = (level: string) => {
    switch (level) {
      case 'L4': return 'bg-red-700';
      case 'L3': return 'bg-red-500';
      case 'L2': return 'bg-orange-500';
      default:   return 'bg-red-300';
    }
  };

  const handleMapLoad`
);

// ── PATCH 4a: Remove old cluster layer IDs from interactiveLayerIds ─────────
src = src.replace(
  `interactiveLayerIds={['clusters', 'unclustered-point', 'district-fill']}`,
  `interactiveLayerIds={['district-fill']}`
);
console.log('✓ interactiveLayerIds updated');

// ── PATCH 4b: Add onMove to main MapGL (after the "Map Loaded" onLoad block) ─
patch('onMove handler added to main MapGL',
`  onLoad={(e) => {
  console.log('Map Loaded');
  e.target.resize();
  setMapLoaded(true);
  }}
  >`,
`  onLoad={(e) => {
  console.log('Map Loaded');
  e.target.resize();
  setMapLoaded(true);
  }}
  onMove={(e) => {
  const map = mapRef.current;
  if (map) {
    const b = map.getBounds();
    if (b) setViewportBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }
  setViewportZoom(Math.round(e.viewState.zoom));
  }}
  >`
);

// ── PATCH 5: Replace old Mapbox cluster Source/Layers with DOM Markers ───────
patch('Layer clusters replaced with DOM Markers',
`  {clusterData && (
  <Source
  id="complaints-clusters"
  type="geojson"
  data={clusterData as any}
  cluster={true}
  clusterMaxZoom={14}
  clusterRadius={50}
  >
  <Layer
  id="clusters"
  type="circle"
  filter={["has", "point_count"]}
  paint={{
  "circle-color": "#7f1d1d",
  "circle-radius": [
  "step",
  ["get", "point_count"],
  15,
  10, 20,
  30, 25
  ],
  "circle-stroke-width": 2,
  "circle-stroke-color": "#ffffff"
  }}
  />
  <Layer
  id="cluster-count"
  type="symbol"
  filter={["has", "point_count"]}
  layout={{
  "text-field": "{point_count_abbreviated}",
  "text-size": 12,
  "text-allow-overlap": true,
  "icon-allow-overlap": true
  }}
  paint={{
  "text-color": "#ffffff"
  }}
  />
  <Layer
  id="unclustered-point"
  type="circle"
  filter={["!", ["has", "point_count"]]}
  paint={{
  "circle-color": "#ef4444",
  "circle-radius": 6,
  "circle-stroke-width": 1,
  "circle-stroke-color": "#ffffff"
  }}
  />
  </Source>
  )}
  </>`,
`  {/* DOM-based supercluster markers */}
  {clusters.map((cluster: any) => {
  const [lng, lat] = cluster.geometry.coordinates;
  const { cluster: isCluster, point_count, urgencyLevel } = cluster.properties;
  if (isCluster) {
    const size = Math.min(40 + Math.log2(point_count) * 6, 64);
    return (
    <Marker key={\`cluster-\${cluster.id}\`} longitude={lng} latitude={lat} anchor="center">
      <button
      onClick={() => {
        const zoom = Math.min(supercluster!.getClusterExpansionZoom(cluster.id), 20);
        mapRef.current?.easeTo({ center: [lng, lat], zoom, duration: 500 });
      }}
      className="bg-white border-2 border-red-500 text-slate-900 font-bold rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
      style={{ width: size, height: size, fontSize: size < 50 ? 12 : 14 }}
      >
      {point_count}
      </button>
    </Marker>
    );
  }
  const colorClass = severityColor(urgencyLevel || 'L1');
  return (
    <Marker key={\`pt-\${cluster.properties.id}\`} longitude={lng} latitude={lat} anchor="center">
    <button
      onClick={() => setSelectedIssue(cluster.properties)}
      title={cluster.properties.summary}
      className={\`w-3 h-3 rounded-full border-2 border-white shadow-md hover:scale-150 transition-transform \${colorClass}\`}
    />
    </Marker>
  );
  })}
  </>`
);

// ── PATCH 6: Simplify handleMapClick ────────────────────────────────────────
patch('handleMapClick simplified',
`  const handleMapClick = (e: any) => {
  const feature = e.features && e.features.find((f: any) => f.layer.id === 'clusters' || f.layer.id === 'unclustered-point');
  if (feature) {
  if (feature.layer.id === 'clusters') {
  const clusterId = feature.properties.cluster_id;
  const mapboxSource = mapRef.current.getSource('complaints-clusters');
  mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
  if (err) return;
  mapRef.current.easeTo({
  center: feature.geometry.coordinates,
  zoom: zoom,
  duration: 500
  });
  });
  } else if (feature.layer.id === 'unclustered-point') {
  setSelectedIssue(feature.properties);
  }
  }
  };`,
`  const handleMapClick = (e: any) => {
  const feature = e.features && e.features.find((f: any) => f.layer.id === 'district-fill');
  if (feature) {
  setSelectedArea(feature.properties);
  }
  };`
);

// ── PATCH 7: Simplify handleMouseMove ───────────────────────────────────────
patch('handleMouseMove simplified',
`  const handleMouseMove = (e: any) => {
  const interactiveFeature = e.features && e.features.find((f: any) => 
  ['clusters', 'unclustered-point'].includes(f.layer.id)
  );
  
  if (interactiveFeature) {
  e.target.getCanvas().style.cursor = 'pointer';
  } else {
  e.target.getCanvas().style.cursor = '';
  }`,
`  const handleMouseMove = (e: any) => {
  const districtFeature = e.features && e.features.find((f: any) => f.layer.id === 'district-fill');
  if (districtFeature) {
  e.target.getCanvas().style.cursor = 'pointer';
  } else {
  e.target.getCanvas().style.cursor = '';
  }`
);

// Restore original line endings and write
const out = hasCRLF ? src.replace(/\n/g, '\r\n') : src;
fs.writeFileSync(filePath, out, 'utf8');
console.log(`\nDone — ${changed} patches applied. File written.`);
