"use client";

import CMMap from "@/components/cm-map";

export default function MapPage() {
 return (
 <div className="flex-1 relative w-full h-full flex flex-col bg-white overflow-hidden">
 <div className="absolute inset-0 w-full h-full overflow-hidden">
 <CMMap previewMode={false} />
 </div>
 </div>
 );
}
