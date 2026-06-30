"use client";

import React, { useState, useEffect } from "react";
import { Search, X, AlertTriangle, MapPin, CheckCircle2, FileText, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

type Urgency = 'Critical' | 'High' | 'Medium' | 'Low';
type Status = 'Open' | 'In Progress' | 'Resolved';

interface Complaint {
 id: string;
 ticket_id: string;
 urgency: Urgency;
 summary: string;
 location: string;
 ward?: string;
 category?: string;
 status: Status;
 notes: string;
 officer_email?: string;
}

const initialComplaints: Complaint[] = [];

const urgencyStyles: Record<Urgency, string> = {
 Critical: 'bg-red-500 text-white',
 High: 'bg-orange-500 text-white',
 Medium: 'bg-amber-100 text-amber-700',
 Low: 'bg-slate-100 text-slate-500',
};

const urgencyBorder: Record<Urgency, string> = {
 Critical: 'border-red-200',
 High: 'border-orange-200',
 Medium: 'border-amber-100',
 Low: 'border-slate-100',
};

// ── Intervention Modal ────────────────────────────────────────────────────────
interface ModalProps {
 complaint: Complaint;
 onClose: () => void;
 onMarkResolved: (id: string, notes: string) => Promise<void>;
}

function InterventionModal({ complaint, onClose, onMarkResolved }: ModalProps) {
 const [notes, setNotes] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

 const handleMarkResolved = async () => {
 if (!notes.trim()) return;
 setIsSubmitting(true);

 // 1. Supabase update
 await onMarkResolved(complaint.id, notes);

 // 2. Send email via Resend API
 setEmailStatus('sending');
 try {
 const res = await fetch('/api/send-intervention', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 complaintId: complaint.id,
 summary: complaint.summary,
 location: complaint.location,
 urgency: complaint.urgency,
 notes,
 officerEmail: complaint.officer_email || 'arindam.shandilya@gmail.com',
 }),
 });
 const result = await res.json();
 if (result.success) {
 setEmailStatus('sent');
 } else {
 console.error('Email failed:', result.error);
 setEmailStatus('failed');
 }
 } catch (err) {
 console.error('Email error:', err);
 setEmailStatus('failed');
 }

 setIsSubmitting(false);
 // Small delay so user sees confirmation, then close
 setTimeout(onClose, 1000);
 };

 const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
 if (e.target === e.currentTarget) onClose();
 };

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
 onClick={handleBackdrop}
 >
 <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">

 {/* Modal Header */}
 <div className="bg-[#0F172A] px-6 py-4 flex items-start justify-between">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <AlertTriangle className="w-4 h-4 text-amber-400" />
 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">CM Intervention</span>
 </div>
 <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${urgencyStyles[complaint.urgency]}`}>
 {complaint.urgency}
 </span>
 </div>
 <button
 onClick={onClose}
 className="text-slate-500 hover:text-white transition p-1 rounded-full hover:bg-slate-700"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Complaint Details Grid */}
 <div className="px-6 pt-5 pb-4">
 <h2 className="text-lg font-bold text-[#0F172A] leading-snug mb-4">
 {complaint.summary}
 </h2>

 <div className="grid grid-cols-2 gap-3 mb-5">
 <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E8EDF5]">
 <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Complaint ID</p>
 <p className="text-sm font-bold text-[#0F172A]">{complaint.ticket_id || complaint.id}</p>
 </div>
 <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E8EDF5]">
 <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Category</p>
 <p className="text-sm font-bold text-[#0F172A]">{complaint.category || 'General'}</p>
 </div>
 <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E8EDF5]">
 <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Location</p>
 <div className="flex items-center gap-1">
 <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
 <p className="text-sm font-bold text-[#0F172A] truncate">{complaint.location}</p>
 </div>
 </div>
 <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E8EDF5]">
 <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide mb-1">Ward</p>
 <p className="text-sm font-bold text-[#0F172A]">{complaint.ward || '—'}</p>
 </div>
 </div>

 {/* Officer Notes Textarea */}
 <div className="mb-5">
 <label className="block text-sm font-bold text-[#0F172A] mb-2">
 Officer Notes
 <span className="text-red-500 ml-1">*</span>
 </label>
 <textarea
 autoFocus
 rows={4}
 className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 resize-none text-slate-800 placeholder:text-slate-400 transition"
 placeholder="Enter intervention instructions, resolution notes, or officer directives..."
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 />
 </div>

 {/* Email status feedback */}
 {emailStatus === 'sent' && (
 <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-3 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
 <Mail className="w-4 h-4" />
 Email dispatched to officer successfully.
 </div>
 )}
 {emailStatus === 'failed' && (
 <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-3 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
 <AlertTriangle className="w-4 h-4" />
 Notes saved. Email could not be sent (check RESEND_API_KEY).
 </div>
 )}

 {/* Action Buttons */}
 <div className="flex justify-end gap-3">
 <button
 onClick={onClose}
 className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
 >
 Cancel
 </button>
 <button
 onClick={handleMarkResolved}
 disabled={isSubmitting || !notes.trim()}
 className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
 >
 <CheckCircle2 className="w-4 h-4" />
 {isSubmitting ? 'Processing…' : 'Mark Resolved'}
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CommandCentrePage() {
 const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
 const [modalComplaint, setModalComplaint] = useState<Complaint | null>(null);
 const [isMounted, setIsMounted] = useState(false);

 useEffect(() => { setIsMounted(true); }, []);

 useEffect(() => {
 async function loadData() {
 try {
 const { getKanbanComplaints } = await import('@/services/complaints');
 const data = await getKanbanComplaints();
 
 const mapSeverity = (severity: string) => {
 if (!severity) return 'Medium';
 const s = severity.toLowerCase();
 if (s === 'critical') return 'Critical';
 if (s === 'high') return 'High';
 if (s === 'low') return 'Low';
 return 'Medium';
 };

 const mapComplaint = (c: any, status: Status): Complaint => ({
 id: c.id,
 ticket_id: c.ticket_id || c.id,
 urgency: mapSeverity(c.severity) as Urgency,
 summary: c.title || 'No Title',
 location: c.city || 'Delhi',
 category: c.categories?.department || c.categories?.name || 'General',
 status,
 notes: c.notes || '',
 });

 const allComplaints = [
 ...data.submitted.map(c => mapComplaint(c, 'Open')),
 ...data.in_progress.map(c => mapComplaint(c, 'In Progress')),
 ...data.resolved.map(c => mapComplaint(c, 'Resolved'))
 ];
 
 setComplaints(allComplaints);
 } catch (err) {
 console.error('Error fetching complaints:', err);
 }
 }
 loadData();
 }, []);

 const updateStatus = async (id: string, newStatus: Status) => {
 setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
 // @ts-ignore
 await supabase.from('complaints').update({ status: newStatus }).eq('id', id);
 };

 const handleMarkResolved = async (id: string, notes: string) => {
 setComplaints(prev => prev.map(c =>
 c.id === id ? { ...c, status: 'Resolved', notes } : c
 ));
 // @ts-ignore
 await supabase.from('complaints').update({ status: 'Resolved', notes }).eq('id', id);
 };

 const onDragEnd = (result: any) => {
 const { destination, source, draggableId } = result;
 if (!destination) return;
 if (destination.droppableId === source.droppableId && destination.index === source.index) return;

 const destStatus = destination.droppableId as Status;

 // Optimistically update status in state
 updateStatus(draggableId, destStatus);

 // If dropped into "In Progress", open the intervention modal
 if (destStatus === 'In Progress') {
 const complaint = complaints.find(c => c.id === draggableId);
 if (complaint) {
 // Small delay so the card visually settles first
 setTimeout(() => setModalComplaint({ ...complaint, status: 'In Progress' }), 200);
 }
 }
 };

 const columns: { title: string; status: Status; color: string; dot: string }[] = [
 { title: 'Open', status: 'Open', color: 'border-amber-400', dot: 'bg-amber-400' },
 { title: 'In Progress', status: 'In Progress', color: 'border-blue-500', dot: 'bg-blue-500' },
 { title: 'Resolved', status: 'Resolved', color: 'border-emerald-500', dot: 'bg-emerald-500' },
 ];

 return (
 <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto overflow-x-hidden w-full bg-[#F8FAFC] [#0a0a0a] text-slate-900 flex flex-col">
 <div className="max-w-[1600px] mx-auto w-full flex-grow flex flex-col h-full space-y-6">

 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
 <div>
 <h1 className="text-2xl font-bold text-slate-900 ">Command Centre</h1>
 <p className="text-sm text-slate-500 mt-1">
 Drag a card to <strong>In Progress</strong> to open the intervention panel.
 </p>
 </div>
 <div className="relative">
 <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
 <input
 type="text"
 placeholder="Search complaints..."
 className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
 />
 </div>
 </div>

 {/* Kanban Board */}
 {isMounted ? (
 <DragDropContext onDragEnd={onDragEnd}>
 <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
 {columns.map(col => {
 const colComplaints = complaints.filter(c => c.status === col.status);
 return (
 <div key={col.status} className="bg-[#F1F5F9] rounded-2xl flex flex-col h-full overflow-hidden">

 {/* Column Header */}
 <div className={`bg-white mx-2 mt-2 p-3 flex items-center justify-between rounded-xl shadow-sm border-l-4 ${col.color}`}>
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${col.dot}`} />
 <h3 className="font-bold text-slate-700 text-sm">{col.title}</h3>
 </div>
 <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 ">
 {colComplaints.length}
 </span>
 </div>

 {/* Drop zone hint for In Progress */}
 {col.status === 'In Progress' && (
 <div className="mx-2 mt-1 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 ">
 <p className="text-[10px] text-blue-500 font-semibold text-center">Drop here to trigger intervention</p>
 </div>
 )}

 <Droppable droppableId={col.status}>
 {(provided, snapshot) => (
 <div
 {...provided.droppableProps}
 ref={provided.innerRef}
 className={`p-2 mt-1 flex-grow overflow-y-auto space-y-3 transition-all duration-200 rounded-b-2xl ${
 snapshot.isDraggingOver
 ? col.status === 'In Progress'
 ? 'bg-blue-100 ring-2 ring-inset ring-blue-300'
 : 'bg-slate-200 '
 : ''
 }`}
 >
 {colComplaints.map((complaint, index) => (
 <Draggable key={complaint.id} draggableId={complaint.id} index={index}>
 {(provided, snapshot) => (
 <div
 ref={provided.innerRef}
 {...provided.draggableProps}
 {...provided.dragHandleProps}
 className={`bg-white p-4 rounded-xl border shadow-sm transition-all duration-150 mx-1 select-none ${
 urgencyBorder[complaint.urgency]
 } ${
 snapshot.isDragging
 ? 'shadow-2xl scale-105 opacity-95 rotate-1 ring-2 ring-blue-300'
 : 'hover:shadow-md hover:-translate-y-0.5'
 }`}
 >
 {/* Card top row */}
 <div className="flex justify-between items-center mb-2.5">
 <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${urgencyStyles[complaint.urgency]}`}>
 {complaint.urgency === 'Critical' ? 'URGENT' : complaint.urgency.toUpperCase()}
 </span>
 <span className="text-[10px] font-semibold text-slate-400 font-mono">{complaint.ticket_id || complaint.id}</span>
 </div>

 {/* Summary */}
 <h4 className="text-[13px] font-bold text-slate-800 mb-2.5 leading-snug">
 {complaint.summary}
 </h4>

 {/* Meta */}
 <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
 <span className="flex items-center gap-1">
 <MapPin className="w-3 h-3 shrink-0" />
 {complaint.location}
 </span>
 {complaint.category && (
 <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-500 truncate">
 {complaint.category}
 </span>
 )}
 </div>

 {/* Notes snippet */}
 {complaint.notes && (
 <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-start gap-1.5 text-xs text-slate-500">
 <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
 <span className="line-clamp-2 italic">{complaint.notes}</span>
 </div>
 )}
 </div>
 )}
 </Draggable>
 ))}
 {provided.placeholder}
 {colComplaints.length === 0 && !snapshot.isDraggingOver && (
 <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs mx-1 gap-1">
 <span>Drop cards here</span>
 </div>
 )}
 </div>
 )}
 </Droppable>
 </div>
 );
 })}
 </div>
 </DragDropContext>
 ) : null}
 </div>

 {/* Intervention Modal — triggered on drop to In Progress */}
 {modalComplaint && (
 <InterventionModal
 complaint={modalComplaint}
 onClose={() => setModalComplaint(null)}
 onMarkResolved={handleMarkResolved}
 />
 )}
 </div>
 );
}
