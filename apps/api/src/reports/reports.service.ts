import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../common/prisma.service';
import { toCsv } from './csv.util';

interface DateRange {
  from?: Date;
  to?: Date;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async tasksCsv({ from, to }: DateRange) {
    const tasks = await this.prisma.task.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: { department: true, recipe: true, assignments: { include: { employee: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const rows = tasks.map((task) => [
      task.title,
      task.department.name,
      task.recipe?.name ?? '',
      task.status,
      task.priority,
      task.assignments.map((a) => a.employee.name).join('; '),
      task.startedAt?.toISOString() ?? '',
      task.finishedAt?.toISOString() ?? '',
      task.createdAt.toISOString(),
    ]);

    return toCsv(
      ['Title', 'Department', 'Recipe', 'Status', 'Priority', 'Assigned To', 'Started At', 'Finished At', 'Created At'],
      rows,
    );
  }

  async attendanceCsv({ from, to }: DateRange) {
    const events = await this.prisma.attendanceEvent.findMany({
      where: { occurredAt: { gte: from, lte: to } },
      include: { employee: true },
      orderBy: { occurredAt: 'desc' },
    });

    const rows = events.map((event) => [
      event.employee.name,
      event.type,
      event.occurredAt.toISOString(),
      event.isLate ? 'Yes' : 'No',
      event.isEarly ? 'Yes' : 'No',
      event.ipAddress ?? '',
      event.device ?? '',
    ]);

    return toCsv(['Employee', 'Type', 'Occurred At', 'Late', 'Early', 'IP Address', 'Device'], rows);
  }

  async inventoryCsv() {
    const items = await this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
    const rows = items.map((item) => [
      item.name,
      item.unit,
      item.quantityOnHand.toString(),
      item.reorderLevel.toString(),
      Number(item.quantityOnHand) <= Number(item.reorderLevel) ? 'Yes' : 'No',
    ]);
    return toCsv(['Name', 'Unit', 'Quantity On Hand', 'Reorder Level', 'Low Stock'], rows);
  }

  async tasksPdf({ from, to }: DateRange): Promise<Buffer> {
    const tasks = await this.prisma.task.findMany({
      where: { createdAt: { gte: from, lte: to } },
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });

    return this.renderPdf('Task Report', (doc) => {
      for (const task of tasks) {
        doc
          .fontSize(11)
          .text(`${task.title}  —  ${task.department.name}  —  ${task.status}`, { continued: false });
        doc.fontSize(9).fillColor('#666').text(`Created ${task.createdAt.toISOString()}`).fillColor('#000');
        doc.moveDown(0.5);
      }
      if (tasks.length === 0) doc.fontSize(11).text('No tasks in this period.');
    });
  }

  private renderPdf(title: string, body: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(18).text(title, { underline: true });
      doc.moveDown();
      body(doc);
      doc.end();
    });
  }
}
