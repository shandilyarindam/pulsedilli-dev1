import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getAllComplaintsData } from '@/services/complaints';

export async function GET(req: NextRequest) {
  try {
    const complaints = await getAllComplaintsData();

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PulseDilli CRM';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('Complaints Export');

    // Define columns
    worksheet.columns = [
      { header: 'Ticket ID', key: 'ticket_id', width: 15 },
      { header: 'Title', key: 'title', width: 30 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Severity', key: 'severity', width: 15 },
      { header: 'City/District', key: 'city', width: 20 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Created At', key: 'created_at', width: 25 },
      { header: 'Resolved At', key: 'resolved_at', width: 25 },
      { header: 'Assigned Officer', key: 'officer', width: 25 },
    ];

    // Add rows
    complaints.forEach((c) => {
      worksheet.addRow({
        ticket_id: c.ticket_id,
        title: c.title,
        status: c.status,
        severity: c.severity,
        city: c.city || 'N/A',
        category: c.categories?.name || 'N/A',
        department: c.categories?.department || 'N/A',
        created_at: new Date(c.created_at).toLocaleString(),
        resolved_at: c.resolved_at ? new Date(c.resolved_at).toLocaleString() : 'Pending',
        officer: c.profiles?.full_name || 'Unassigned',
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' }, // Red-600
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Audit Logging
    console.log('[Audit Log] Excel Export Generated:', {
      timestamp: new Date().toISOString(),
      rowCount: complaints.length,
    });

    // Return as downloadable file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="PulseDilli_Complaints_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });

  } catch (err) {
    console.error('Excel export error:', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
