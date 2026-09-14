const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, BorderStyle, ShadingType, VerticalAlign, HeadingLevel, PageBreak
} = require('docx');
const fs = require('fs');

const NAVY = '1F3864', GREY = 'F2F2F2', LIGHT = 'FAFAFA', ACCENT = 'C00000';
const W = { num: 600, des: 5200, qte: 700, pu: 1600, mt: 1800 };
const TOTAL_W = W.num + W.des + W.qte + W.pu + W.mt;

const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const noBorders = {
  top:    { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left:   { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right:  { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const p = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.LEFT,
  spacing: { before: o.before || 0, after: o.after === undefined ? 60 : o.after },
  children: [new TextRun({
    text, bold: !!o.bold, italics: !!o.it, size: o.size || 20,
    color: o.color || '000000', font: 'Calibri', allCaps: !!o.caps,
  })],
});

const cell = (text, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
  verticalAlign: VerticalAlign.CENTER,
  columnSpan: o.span,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: (Array.isArray(text) ? text : [text]).map((t, i) => new Paragraph({
    alignment: o.align || AlignmentType.LEFT,
    spacing: { after: 0 },
    children: [new TextRun({
      text: t, bold: !!o.bold, italics: i > 0 || !!o.it,
      size: i > 0 ? 16 : (o.size || 18),
      color: i > 0 ? '595959' : (o.color || '000000'), font: 'Calibri',
    })],
  })),
});

/* ---------------- LIGNES DU DEVIS ---------------- */
const sections = [
  {
    titre: 'A — REMISE EN ÉTAT DES ÉQUIPEMENTS',
    lignes: [
      { d: 'Actionneur électrique AOX-M-060 — carte de commande réf. C1171-M1',
        s: ['Code câblage M-280-10 · 400 V AC · 400-540 Nm · 67 tr/min · IP67',
            'Diagnostic sur banc, remplacement des relais de puissance et du bloc contacteur,',
            'contrôle des alimentations 24 V / 5 V, reprise des soudures, tropicalisation,',
            'essais de manœuvre ouverture/fermeture en charge.'],
        q: 1, pu: 485000 },
      { d: 'Actionneur électrique ROTORK (commande locale + volant de secours)',
        s: ['Diagnostic complet, remise en état de la carte de commande et des contacteurs,',
            'contrôle du moteur et des isolements, réglage des fins de course et du limiteur',
            'de couple, essais de manœuvre et vérification de la recopie de position.'],
        q: 1, pu: 750000 },
      { d: 'Transmetteur de pression SIEMENS SITRANS P320',
        s: ['Réf. 7MF03D0-1VE01-5AF2-Z · 4-20 mA HART · 10,5-45 V DC · IP66',
            'Diagnostic électronique, remise en état, contrôle d’étanchéité de la cellule,',
            'réétalonnage 5 points avec certificat de vérification raccordé étalon.'],
        q: 1, pu: 395000 },
      { d: 'Positionneur de vanne ROTORK YTC YT-200',
        s: ['Révision complète : nettoyage du bloc pneumatique, remplacement du kit joints',
            'et du relais pilote, réglage de la course, calibration du signal 4-20 mA,',
            'essais de réponse et de linéarité sur banc.'],
        q: 1, pu: 320000 },
      { d: 'Alimentation PULS DIMENSION CP10.481 (repère -FA1)',
        s: ['48 V DC / 5,4 A · entrée 100-240 V AC · contact DC-ok 13/14',
            'Réparation des étages primaire et secondaire, remplacement des condensateurs',
            'électrolytiques et du circuit de commutation, essais en charge sur 8 heures.'],
        q: 1, pu: 185000 },
    ],
  },
  {
    titre: 'B — PIÈCES DÉTACHÉES ET CONSOMMABLES',
    lignes: [
      { d: 'Kit de composants électroniques',
        s: ['Relais de puissance, condensateurs, optocoupleurs, régulateurs, borniers,',
            'connecteurs et composants de commutation.'],
        q: 1, pu: 275000 },
      { d: 'Consommables d’atelier',
        s: ['Soudure, tresse à dessouder, vernis de tropicalisation, produits de nettoyage,',
            'gaines thermorétractables et visserie.'],
        q: 1, pu: 45000 },
    ],
  },
  {
    titre: 'C — ESSAIS, LOGISTIQUE ET DOCUMENTATION',
    lignes: [
      { d: 'Essais de validation sur banc et rapport de test',
        s: ['Par équipement, avant restitution.'], q: 5, pu: 35000 },
      { d: 'Enlèvement et restitution du matériel',
        s: ['Rotation atelier ↔ site Atinkou, transport et manutention inclus.'], q: 2, pu: 90000 },
      { d: 'Dossier technique de fin d’intervention',
        s: ['Rapport de diagnostic, relevés de mesures, certificats d’étalonnage (PDF + papier).'],
        q: 1, pu: 60000 },
    ],
  },
];

const REMISE_PCT = 5, TVA_PCT = 18;
let totalHT = 0;
sections.forEach(s => s.lignes.forEach(l => { totalHT += l.q * l.pu; }));
const remise = Math.round(totalHT * REMISE_PCT / 100);
const netHT = totalHT - remise;
const tva = Math.round(netHT * TVA_PCT / 100);
const ttc = netHT + tva;

/* ---------------- TABLEAU ---------------- */
const rows = [];
rows.push(new TableRow({
  tableHeader: true,
  children: [
    cell('N°', { w: W.num, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.CENTER }),
    cell('Désignation des prestations', { w: W.des, fill: NAVY, color: 'FFFFFF', bold: true }),
    cell('Qté', { w: W.qte, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.CENTER }),
    cell('P.U. HT', { w: W.pu, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.RIGHT }),
    cell('Montant HT', { w: W.mt, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.RIGHT }),
  ],
}));

let n = 0;
sections.forEach(sec => {
  rows.push(new TableRow({
    children: [new TableCell({
      width: { size: TOTAL_W, type: WidthType.DXA },
      columnSpan: 5,
      shading: { type: ShadingType.CLEAR, fill: GREY, color: 'auto' },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ spacing: { after: 0 }, children: [
        new TextRun({ text: sec.titre, bold: true, size: 18, color: NAVY, font: 'Calibri' })] })],
    })],
  }));
  sec.lignes.forEach(l => {
    n += 1;
    rows.push(new TableRow({
      children: [
        cell(String(n), { w: W.num, align: AlignmentType.CENTER }),
        cell([l.d, ...l.s], { w: W.des, bold: true }),
        cell(String(l.q), { w: W.qte, align: AlignmentType.CENTER }),
        cell(fmt(l.pu), { w: W.pu, align: AlignmentType.RIGHT }),
        cell(fmt(l.q * l.pu), { w: W.mt, align: AlignmentType.RIGHT, bold: true }),
      ],
    }));
  });
});

const totalRow = (label, value, o = {}) => new TableRow({
  children: [
    new TableCell({
      width: { size: W.num + W.des + W.qte, type: WidthType.DXA }, columnSpan: 3,
      borders: noBorders, children: [new Paragraph({ spacing: { after: 0 }, children: [] })],
    }),
    cell(label, { w: W.pu, bold: true, align: AlignmentType.RIGHT, fill: o.fill || LIGHT, color: o.color }),
    cell(value, { w: W.mt, bold: true, align: AlignmentType.RIGHT, fill: o.fill || LIGHT, color: o.color, size: o.size }),
  ],
});

rows.push(totalRow('TOTAL HT', fmt(totalHT)));
rows.push(totalRow('Remise commerciale ' + REMISE_PCT + ' %', '- ' + fmt(remise)));
rows.push(totalRow('NET HT', fmt(netHT)));
rows.push(totalRow('TVA ' + TVA_PCT + ' %', fmt(tva)));
rows.push(totalRow('TOTAL TTC (FCFA)', fmt(ttc), { fill: NAVY, color: 'FFFFFF', size: 22 }));

const table = new Table({
  columnWidths: [W.num, W.des, W.qte, W.pu, W.mt],
  width: { size: TOTAL_W, type: WidthType.DXA },
  rows,
});

/* ---------------- OPTIONS ---------------- */
const OW = { des: 6500, pu: 3400 };
const options = [
  ['Fourniture d’une carte de commande AOX neuve réf. C1171-M1 (si réparation non concluante)', 1150000],
  ['Fourniture d’un transmetteur SIEMENS SITRANS P320 neuf, réf. 7MF03D0-1VE01-5AF2-Z', 2350000],
  ['Fourniture d’une alimentation PULS DIMENSION CP10.481 neuve', 395000],
  ['Contrat de maintenance préventive annuelle (2 visites sur site, instrumentation et actionneurs)', 1800000],
];
const optTable = new Table({
  columnWidths: [OW.des, OW.pu],
  width: { size: OW.des + OW.pu, type: WidthType.DXA },
  rows: [
    new TableRow({ tableHeader: true, children: [
      cell('Option (non incluse dans le total ci-dessus)', { w: OW.des, fill: NAVY, color: 'FFFFFF', bold: true }),
      cell('Prix HT (FCFA)', { w: OW.pu, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.RIGHT }),
    ]}),
    ...options.map(([d, v]) => new TableRow({ children: [
      cell(d, { w: OW.des }),
      cell(fmt(v), { w: OW.pu, align: AlignmentType.RIGHT, bold: true }),
    ]})),
  ],
});

/* ---------------- EN-TÊTE ---------------- */
const headerTable = new Table({
  columnWidths: [5400, 4500],
  width: { size: 9900, type: WidthType.DXA },
  borders: {
    top: noBorders.top, bottom: noBorders.bottom, left: noBorders.left, right: noBorders.right,
    insideHorizontal: noBorders.top, insideVertical: noBorders.left,
  },
  rows: [new TableRow({ children: [
    new TableCell({
      width: { size: 5400, type: WidthType.DXA }, borders: noBorders,
      margins: { top: 0, bottom: 0, left: 0, right: 120 },
      children: [
        p('[VOTRE SOCIÉTÉ]', { bold: true, size: 26, color: NAVY }),
        p('Maintenance électronique et instrumentation industrielle', { size: 17, it: true, color: '595959' }),
        p('[Adresse — Zone industrielle, Abidjan]', { size: 17 }),
        p('Tél. : [+225 XX XX XX XX XX]', { size: 17 }),
        p('E-mail : thortechnologie@gmail.com', { size: 17 }),
        p('RCCM : [N°] — CC : [N° Compte Contribuable]', { size: 17 }),
      ],
    }),
    new TableCell({
      width: { size: 4500, type: WidthType.DXA }, borders: noBorders,
      shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
      margins: { top: 140, bottom: 140, left: 160, right: 160 },
      children: [
        p('CLIENT', { bold: true, size: 16, color: NAVY }),
        p('ATINKOU', { bold: true, size: 22 }),
        p('[Centrale thermique — Jacqueville, Côte d’Ivoire]', { size: 17 }),
        p('À l’attention de : [Nom du destinataire]', { size: 17 }),
        p('Service : Maintenance / Instrumentation', { size: 17 }),
      ],
    }),
  ]})],
});

/* ---------------- DOCUMENT ---------------- */
const doc = new Document({
  creator: 'Board Doctor',
  title: 'Devis proforma — ATINKOU',
  sections: [{
    properties: { page: { margin: { top: 900, right: 1000, bottom: 900, left: 1000 } } },
    children: [
      headerTable,
      new Paragraph({ spacing: { after: 200 }, children: [] }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 6 } },
        children: [new TextRun({ text: 'DEVIS PROFORMA', bold: true, size: 34, color: NAVY, font: 'Calibri' })],
      }),
      new Paragraph({ spacing: { after: 180 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: 'N° PRO-2026-014   ·   Abidjan, le 14 septembre 2026   ·   Validité : 30 jours',
          size: 18, color: '595959', font: 'Calibri' })]}),

      p('OBJET : Dépannage et remise en état d’équipements d’instrumentation et de robinetterie motorisée',
        { bold: true, size: 20, color: NAVY, after: 80 }),
      p('Suite à votre demande et à l’examen du matériel qui nous a été confié, nous avons l’honneur de vous soumettre notre proposition chiffrée pour le diagnostic, la réparation et la remise en service des cinq équipements listés ci-dessous. Les prestations comprennent les essais de validation en atelier et la remise d’un dossier technique.',
        { size: 19, after: 200 }),

      table,

      new Paragraph({ spacing: { after: 120 }, children: [] }),
      p('Arrêté le présent devis proforma à la somme de : ' + fmt(ttc) + ' FCFA TTC.',
        { bold: true, size: 20, color: ACCENT, after: 160 }),

      new Paragraph({ children: [new PageBreak()] }),

      p('OPTIONS ET FOURNITURES COMPLÉMENTAIRES', { bold: true, size: 20, color: NAVY, after: 100 }),
      p('Les montants ci-après ne sont pas inclus dans le total. Ils ne seront engagés qu’après votre accord écrit, notamment si le diagnostic atelier conclut au caractère irréparable d’un sous-ensemble.',
        { size: 18, it: true, after: 120 }),
      optTable,

      new Paragraph({ spacing: { after: 260 }, children: [] }),
      p('CONDITIONS COMMERCIALES ET TECHNIQUES', { bold: true, size: 20, color: NAVY, after: 100 }),
      ...[
        ['Validité de l’offre', '30 jours à compter de la date d’émission.'],
        ['Délai d’exécution', '15 jours ouvrés à compter de la réception du bon de commande et du matériel complet. Délai porté à 6 semaines si une fourniture neuve à l’import est retenue.'],
        ['Modalités de paiement', '50 % à la commande, solde à la restitution du matériel, par virement bancaire. Coordonnées bancaires : [Banque — IBAN / N° de compte].'],
        ['Garantie', '3 mois sur les prestations de réparation et les pièces remplacées, à compter de la date de restitution. La garantie ne couvre pas les dommages consécutifs à une surtension, une infiltration d’eau ou une intervention d’un tiers.'],
        ['Diagnostic', 'Le forfait diagnostic est intégré au prix de réparation. En cas de refus du devis après démontage, seuls les frais de diagnostic et de transport restent dus.'],
        ['Pièces non réparables', 'Tout composant jugé irréparable fait l’objet d’un avenant chiffré soumis à votre accord préalable.'],
        ['Prix', 'Montants exprimés en francs CFA (XOF), hors taxes, TVA 18 % en sus. Transport et manutention inclus pour deux rotations Abidjan ↔ site.'],
      ].map(([k, v]) => new Paragraph({
        spacing: { after: 90 },
        children: [
          new TextRun({ text: k + ' : ', bold: true, size: 18, color: NAVY, font: 'Calibri' }),
          new TextRun({ text: v, size: 18, font: 'Calibri' }),
        ],
      })),

      new Paragraph({ spacing: { after: 320 }, children: [] }),
      new Table({
        columnWidths: [4950, 4950],
        width: { size: 9900, type: WidthType.DXA },
        borders: {
          top: noBorders.top, bottom: noBorders.bottom, left: noBorders.left, right: noBorders.right,
          insideHorizontal: noBorders.top, insideVertical: noBorders.left,
        },
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: 4950, type: WidthType.DXA }, borders: noBorders,
            children: [
              p('Pour le client — ATINKOU', { bold: true, size: 18 }),
              p('« Bon pour accord », date, cachet et signature', { size: 16, it: true, color: '595959', after: 700 }),
              new Paragraph({ spacing: { after: 0 },
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: '808080', space: 4 } }, children: [] }),
            ]}),
          new TableCell({ width: { size: 4950, type: WidthType.DXA }, borders: noBorders,
            margins: { left: 300 },
            children: [
              p('Pour [VOTRE SOCIÉTÉ]', { bold: true, size: 18 }),
              p('Le Responsable technique', { size: 16, it: true, color: '595959', after: 700 }),
              new Paragraph({ spacing: { after: 0 },
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: '808080', space: 4 } }, children: [] }),
            ]}),
        ]})],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync('Proforma_ATINKOU_PRO-2026-014.docx', b);
  console.log('OK — Total HT', fmt(totalHT), '| Net HT', fmt(netHT), '| TVA', fmt(tva), '| TTC', fmt(ttc));
});
