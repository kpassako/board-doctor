import jsPDF from 'jspdf';
import type { Diagnostic } from '../types';

export async function generateDiagnosticPDF(diagnostic: Diagnostic) {
  console.log('Génération PDF pour:', diagnostic);
  
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.text('Rapport de Diagnostic', 105, y, { align: 'center' });
  y += 15;

  doc.setFontSize(12);
  doc.text('Titre: ' + diagnostic.title, 20, y);
  y += 10;
  doc.text('Type: ' + diagnostic.deviceType, 20, y);
  y += 10;
  doc.text('Date: ' + new Date(diagnostic.createdAt).toLocaleDateString('fr-FR'), 20, y);
  y += 10;
  doc.text('Etat: ' + diagnostic.status, 20, y);
  y += 15;

  if (diagnostic.measurements && diagnostic.measurements.length > 0) {
    doc.setFontSize(14);
    doc.text('Mesures:', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    diagnostic.measurements.forEach((m: any) => {
      const line = m.railName + ': ' + m.measuredVoltage + 'V (attendu: ' + m.expectedVoltage + 'V)';
      doc.text(line, 25, y);
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  if (diagnostic.photos && diagnostic.photos.length > 0) {
    y += 10;
    doc.setFontSize(14);
    doc.text('Photos: ' + diagnostic.photos.length + ' attachees', 20, y);
  }

  if (diagnostic.notes) {
    y += 15;
    doc.setFontSize(14);
    doc.text('Notes:', 20, y);
    y += 10;
    doc.setFontSize(10);
    const notes = doc.splitTextToSize(diagnostic.notes, 170);
    doc.text(notes, 20, y);
  }

  const filename = 'diagnostic_' + diagnostic.title.replace(/\s+/g, '_') + '_' + Date.now() + '.pdf';
  doc.save(filename);
  console.log('PDF téléchargé:', filename);
}