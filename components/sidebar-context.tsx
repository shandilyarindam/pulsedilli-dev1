"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, memo } from "react";

interface SidebarContextType {
 isCollapsed: boolean;
 setIsCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
 isCollapsed: true,
 setIsCollapsed: () => {},
});

export function useSidebar() {
 return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
 const [isCollapsed, setIsCollapsed] = useState(true);
 return (
 <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
 {children}
 </SidebarContext.Provider>
 );
}
