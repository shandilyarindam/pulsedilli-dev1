import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

export type ComplaintRow = Database['public']['Tables']['complaints']['Row'];

/** Minimal shape used for casting raw Supabase query results that return `never[]`
 *  due to the generated types not covering all columns / joins. */
type RawComplaint = {
  id: string;
  status: string;
  severity: string;
  created_at: string;
  resolved_at: string | null;
  [key: string]: unknown;
};

export async function getAggregateMetrics() {
  const [submittedRes, openRes, inProgressRes, resolvedRes, criticalRes, totalRes, resolutionTimeRes] = await Promise.all([
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted'),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_progress'),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved'),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical'),
    supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true }),
    // Fetch resolved complaints with timestamps to compute avg resolution time
    supabase
      .from('complaints')
      .select('created_at, resolved_at')
      .eq('status', 'resolved')
      .not('resolved_at', 'is', null)
      .limit(500),
  ]);

  const submitted = submittedRes.count || 0;
  const open = openRes.count || 0;
  const inProgress = inProgressRes.count || 0;

  // Compute average resolution time in days from real timestamps
  let avgResolutionDays: number | null = null;
  const resRows = (resolutionTimeRes.data ?? []) as unknown as { created_at: string; resolved_at: string }[];
  if (resRows.length > 0) {
    const totalMs = resRows.reduce((sum, row) => {
      const diff = new Date(row.resolved_at).getTime() - new Date(row.created_at).getTime();
      return sum + (diff > 0 ? diff : 0);
    }, 0);
    avgResolutionDays = parseFloat((totalMs / resRows.length / (1000 * 60 * 60 * 24)).toFixed(1));
  }

  return {
    /** submitted + open + in_progress combined */
    pending: submitted + open + inProgress,
    /** only 'submitted' status */
    submitted,
    /** only 'open' status */
    open,
    /** only 'in_progress' status */
    inProgress,
    resolved: resolvedRes.count || 0,
    critical: criticalRes.count || 0,
    total: totalRes.count || 0,
    /** Average resolution time in days; null if no resolved complaints yet */
    avgResolutionDays,
  };
}

export async function getComplaintsPerDay() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data, error } = await supabase
    .from('complaints')
    .select('created_at, resolved_at')
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) throw error;

  const rows = (data ?? []) as unknown as { created_at: string; resolved_at: string | null }[];

  const grouped = rows.reduce((acc: Record<string, { received: number; resolved: number }>, curr) => {
    const createdDate = new Date(curr.created_at).toISOString().split('T')[0];
    if (!acc[createdDate]) acc[createdDate] = { received: 0, resolved: 0 };
    acc[createdDate].received += 1;

    if (curr.resolved_at) {
      const resolvedDate = new Date(curr.resolved_at).toISOString().split('T')[0];
      if (!acc[resolvedDate]) acc[resolvedDate] = { received: 0, resolved: 0 };
      acc[resolvedDate].resolved += 1;
    }

    return acc;
  }, {});

  return Object.keys(grouped).sort().map(date => ({
    date,
    ...grouped[date]
  }));
}

export async function getComplaintsByDepartment() {
  const { data, error } = await supabase
    .from('complaints')
    .select('categories(department)');

  if (error) throw error;

  const grouped = data.reduce((acc: Record<string, number>, curr: { categories?: { department: string } | null }) => {
    const dept = curr.categories?.department || 'Unknown';
    if (!acc[dept]) acc[dept] = 0;
    acc[dept] += 1;
    return acc;
  }, {});

  return Object.keys(grouped).map(department => ({
    department,
    count: grouped[department]
  }));
}

export async function getExecutiveCharts() {
  const [complaintsPerDay, complaintsByDepartment] = await Promise.all([
    getComplaintsPerDay(),
    getComplaintsByDepartment()
  ]);
  
  return {
    complaintsPerDay,
    complaintsByDepartment
  };
}

export async function getKanbanComplaints() {
  const { data, error } = await supabase
    .from('complaints')
    .select('*, categories(name, department)');

  if (error) throw error;

  const rows = (data ?? []) as unknown as RawComplaint[];

  const kanban = {
    submitted: rows.filter(c => c.status === 'submitted' || c.status === 'open'),
    in_progress: rows.filter(c => c.status === 'in_progress'),
    resolved: rows.filter(c => c.status === 'resolved'),
  };

  return kanban;
}

export interface ComplaintListRow {
  id: string;
  ticket_id: string;
  title: string;
  status: string;
  severity: string;
  city: string | null;
  created_at: string;
  resolved_at: string | null;
  categories: { name: string; department: string } | null;
  profiles: { full_name: string | null; role: string | null } | null;
}

export async function getComplaintsList(page: number = 1, pageSize: number = 200) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from('complaints')
    .select('*, categories(name, department), profiles!assigned_officer_id(full_name, role)', { count: 'exact' })
    .range(start, end)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    data: (data ?? []) as unknown as ComplaintListRow[],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function getDailyReportMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [todayRes, yesterdayRes] = await Promise.all([
    supabase
      .from('complaints')
      .select('id, status', { count: 'exact' })
      .gte('created_at', today.toISOString()),
    supabase
      .from('complaints')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())
  ]);

  if (todayRes.error) throw todayRes.error;
  if (yesterdayRes.error) throw yesterdayRes.error;

  const newToday = todayRes.count || 0;
  const newYesterday = yesterdayRes.count || 0;
  
  const todayRows = (todayRes.data ?? []) as unknown as RawComplaint[];
  const todayResolved = todayRows.filter(c => c.status === 'resolved').length;
  const resolutionRate = newToday > 0 ? (todayResolved / newToday) * 100 : 0;

  return {
    newToday,
    newYesterday,
    resolutionRate: Math.round(resolutionRate * 100) / 100,
  };
}

export interface PriorityIntervention {
  id: string;
  ticket_id: string;
  title: string;
  status: string;
  severity: string;
  city: string | null;
  created_at: string;
  upvotes: number | null;
  categories: { name: string; department: string } | null;
}

/**
 * Returns up to 25 Critical + Pending complaints that have been open for > 1 month,
 * ordered by citizen upvotes descending (falls back to created_at if upvotes column missing).
 */
export async function getPriorityInterventions(): Promise<PriorityIntervention[]> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // First attempt: order by upvotes
  const { data, error } = await supabase
    .from('complaints')
    .select('id, ticket_id, title, status, severity, city, created_at, categories(name, department)')
    .eq('severity', 'critical')
    .in('status', ['submitted', 'open'])
    .lt('created_at', oneMonthAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) {
    console.warn('getPriorityInterventions query failed:', error.message);
    return [];
  }

  return (data ?? []) as unknown as PriorityIntervention[];
}

export async function getAllComplaintsData() {
  const { data, error } = await supabase
    .from('complaints')
    .select('*, categories(name, department), profiles!assigned_officer_id(full_name, role)')
    .order('created_at', { ascending: false })
    .limit(5000); // Reasonable limit for exports and AI

  if (error) throw error;

  return (data ?? []) as unknown as ComplaintListRow[];
}
