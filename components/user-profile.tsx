"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function UserProfile() {
 return (
 <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-2 shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 :bg-slate-700 transition-colors">
 <div className="relative h-16 w-16 shrink-0">
 <img
 src="/rekha_gupta.jpg"
 alt="CM"
 className="h-full w-full object-cover rounded-full"
 onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Rekha+Gupta&size=64&background=1e40af&color=ffffff'; }}
 />
 <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#22C55E] border-2 border-white " />
 </div>
 <div className="flex flex-col leading-tight pr-1">
 <span className="text-[13px] font-bold text-slate-900 ">Smt. Rekha Gupta</span>
 <span className="text-[11px] font-semibold text-slate-500 ">Chief Minister, Delhi</span>
 </div>
 <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
 </div>
 );
}
