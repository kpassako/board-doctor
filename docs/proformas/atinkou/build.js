const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, BorderStyle, ShadingType, VerticalAlign, PageBreak
} = require('docx');
const fs = require('fs');

const NAVY = '1F3864', GREY = 'F2F2F2', LIGHT = 'FAFAFA', ACCENT = 'C00000';
const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const fmtH = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '&nbsp;');

/* ============================ DONNÉES ============================ */

const TVA = 18;

const A = {
  ref: 'PRO-2026-014/A',
  phase: 'PHASE 1 — FOURNITURES ET COMPOSANTS',
  objet: 'OBJET : Fourniture des composants, pièces détachées et consommables nécessaires au dépannage des équipements',
  intro: 'Le présent document couvre exclusivement l’approvisionnement des pièces et composants indispensables à la remise en état des équipements qui nous ont été confiés. Les composants sont commandés sur mesure auprès de nos fournisseurs après réception de votre accord. Les prestations de démontage, réparation, essais et étalonnage font l’objet d’un devis distinct (réf. PRO-2026-014/B).',
  remisePct: 0,
  sections: [
    { titre: 'A — COMPOSANTS PAR ÉQUIPEMENT', lignes: [
      { d: 'Jeu de relais de puissance et bloc contacteur — carte AOX réf. C1171-M1',
        s: ['4 relais de puissance et bloc contacteur 400 V compatibles actionneur AOX-M-060.'],
        q: 1, pu: 185000 },
      { d: 'Composants électroniques — carte de commande AOX C1171-M1',
        s: ['Condensateurs électrolytiques, régulateurs de tension, optocoupleurs,',
            'diodes de roue libre, borniers et connecteurs de puissance.'],
        q: 1, pu: 95000 },
      { d: 'Kit de joints et relais pilote — positionneur ROTORK YTC YT-200',
        s: ['Kit d’étanchéité complet du bloc pneumatique et relais pilote de rechange.'],
        q: 1, pu: 95000 },
      { d: 'Condensateurs et composants de commutation — alimentation PULS CP10.481',
        s: ['Condensateurs électrolytiques basse ESR, transistor de commutation,',
            'composants de l’étage primaire 100-240 V AC.'],
        q: 1, pu: 65000 },
      { d: 'Connectique, joints et pièces de reprise — transmetteurs SITRANS P320',
        s: ['Réf. 7MF03D0-1VE01-5AF2-Z · joints de raccord process, presse-étoupes,',
            'bornier de raccordement et composants de la carte électronique.',
            'Quantité pour trois transmetteurs.'],
        q: 3, pu: 45000 },
    ]},
    { titre: 'B — CONSOMMABLES ET APPROVISIONNEMENT', lignes: [
      { d: 'Consommables d’atelier',
        s: ['Soudure, tresse à dessouder, vernis de tropicalisation, produits de nettoyage',
            'de cartes, gaines thermorétractables et visserie.'],
        q: 1, pu: 45000 },
      { d: 'Frais d’approvisionnement et d’acheminement',
        s: ['Sourcing fournisseurs, commande, transit et dédouanement des composants',
            'non disponibles sur le marché local.'],
        q: 1, pu: 85000 },
    ]},
  ],
  options: [
    ['Carte de commande AOX neuve réf. C1171-M1 — en remplacement de la réparation', 1150000],
    ['Transmetteur SIEMENS SITRANS P320 neuf, réf. 7MF03D0-1VE01-5AF2-Z (prix unitaire)', 2350000],
    ['Alimentation PULS DIMENSION CP10.481 neuve — en remplacement de la réparation', 395000],
  ],
  optTitre: 'OPTIONS — FOURNITURES NEUVES',
  optIntro: 'Ces montants ne sont pas inclus dans le total. Ils s’appliquent si le diagnostic conclut au caractère irréparable d’un sous-ensemble ; le montant de la réparation correspondante est alors déduit.',
  conditions: [
    ['Portée du devis', 'Le présent proforma couvre uniquement les fournitures. Il ne comprend aucune prestation de main d’œuvre, d’essai ou d’étalonnage.'],
    ['Validité de l’offre', '15 jours. Les composants étant importés, les prix sont indexés sur le cours d’achat au jour de la commande.'],
    ['Modalités de paiement', '100 % à la commande. Les composants sont approvisionnés spécifiquement pour votre matériel : ils ne sont ni repris ni échangés une fois commandés.'],
    ['Délai d’approvisionnement', '7 à 21 jours ouvrés selon la disponibilité des références auprès des fournisseurs.'],
    ['Garantie', 'Garantie constructeur des composants fournis. La garantie de fonctionnement de l’ensemble est couverte par le devis de prestations PRO-2026-014/B.'],
    ['Suite à donner', 'Le règlement du présent proforma déclenche l’approvisionnement. Les travaux de remise en état ne débutent qu’après acceptation du devis PRO-2026-014/B.'],
    ['Prix', 'Montants exprimés en francs CFA (XOF), hors taxes, TVA 18 % en sus.'],
  ],
};

const B = {
  ref: 'PRO-2026-014/B',
  phase: 'PHASE 2 — PRESTATIONS DE REMISE EN ÉTAT',
  objet: 'OBJET : Dépannage, remise en état et remise en service des équipements d’instrumentation et de robinetterie motorisée',
  intro: 'Le présent document couvre la main d’œuvre, les essais et l’étalonnage nécessaires à la remise en service des équipements qui nous ont été confiés. Les composants et consommables font l’objet du devis PRO-2026-014/A et ne sont pas refacturés ici. Les travaux débutent après réception des fournitures de la phase 1.',
  remisePct: 5,
  sections: [
    { titre: 'A — MAIN D’ŒUVRE DE REMISE EN ÉTAT', lignes: [
      { d: 'Carte de commande actionneur AOX-M-060 réf. C1171-M1',
        s: ['Code câblage M-280-10 · 400 V AC · 400-540 Nm · 67 tr/min · IP67',
            'Dépose et diagnostic sur banc, remplacement des relais de puissance et du bloc',
            'contacteur, contrôle des alimentations 24 V / 5 V, reprise des soudures,',
            'tropicalisation, remontage et essais de manœuvre en charge.'],
        q: 1, pu: 350000 },
      { d: 'Transmetteurs de pression SIEMENS SITRANS P320',
        s: ['Réf. 7MF03D0-1VE01-5AF2-Z · 4-20 mA HART · 10,5-45 V DC · IP66',
            'Diagnostic électronique, remise en état, contrôle d’étanchéité de la cellule,',
            'réétalonnage 5 points et certificat de vérification raccordé étalon.',
            'Prestation appliquée à chacun des trois transmetteurs confiés.'],
        q: 3, pu: 350000 },
      { d: 'Positionneur de vanne ROTORK YTC YT-200',
        s: ['Démontage et nettoyage du bloc pneumatique, pose du kit joints et du relais',
            'pilote, réglage de la course, calibration du signal 4-20 mA,',
            'essais de réponse et de linéarité sur banc.'],
        q: 1, pu: 180000 },
      { d: 'Alimentation PULS DIMENSION CP10.481 (repère -FA1)',
        s: ['48 V DC / 5,4 A · entrée 100-240 V AC · contact DC-ok 13/14',
            'Réparation des étages primaire et secondaire, remplacement des condensateurs',
            'et du circuit de commutation, essais en charge sur 8 heures.'],
        q: 1, pu: 130000 },
    ]},
    { titre: 'B — ESSAIS ET DOCUMENTATION', lignes: [
      { d: 'Essais de validation sur banc et rapport de test',
        s: ['Par équipement, avant restitution. Six unités concernées.'], q: 6, pu: 35000 },
      { d: 'Dossier technique de fin d’intervention',
        s: ['Rapport de diagnostic, relevés de mesures et certificats d’étalonnage',
            '(remis au format PDF et en copie papier).'], q: 1, pu: 60000 },
    ]},
  ],
  options: [
    ['Contrat de maintenance préventive annuelle — 2 visites sur site (instrumentation et actionneurs)', 1800000],
    ['Intervention de remise en service sur site, par journée technicien', 185000],
  ],
  optTitre: 'OPTIONS — PRESTATIONS COMPLÉMENTAIRES',
  optIntro: 'Ces montants ne sont pas inclus dans le total et ne seront engagés qu’après votre accord écrit.',
  conditions: [
    ['Portée du devis', 'Le présent proforma couvre uniquement la main d’œuvre, les essais et l’étalonnage. Les composants et consommables sont facturés au devis PRO-2026-014/A.'],
    ['Prérequis', 'L’exécution des travaux est conditionnée au règlement du devis PRO-2026-014/A et à la réception effective des composants approvisionnés.'],
    ['Validité de l’offre', '30 jours à compter de la date d’émission.'],
    ['Délai d’exécution', '10 jours ouvrés à compter de la réception des fournitures de la phase 1.'],
    ['Modalités de paiement', '100 % à la restitution du matériel, par virement bancaire. Coordonnées bancaires : [Banque — IBAN / N° de compte].'],
    ['Garantie', '3 mois sur les prestations de réparation, à compter de la date de restitution. La garantie ne couvre pas les dommages consécutifs à une surtension, une infiltration d’eau ou une intervention d’un tiers.'],
    ['Pièces non réparables', 'Tout composant jugé irréparable en cours de travaux fait l’objet d’un avenant chiffré soumis à votre accord préalable.'],
    ['Logistique', 'L’enlèvement et la restitution du matériel sont à la charge du client.'],
    ['Prix', 'Montants exprimés en francs CFA (XOF), hors taxes, TVA 18 % en sus.'],
  ],
};

/* ============================ CALCULS ============================ */
function totaux(spec) {
  let ht = 0;
  spec.sections.forEach(s => s.lignes.forEach(l => ht += l.q * l.pu));
  const remise = Math.round(ht * spec.remisePct / 100);
  const net = ht - remise;
  const tva = Math.round(net * TVA / 100);
  return { ht, remise, net, tva, ttc: net + tva };
}
const tA = totaux(A), tB = totaux(B);
const PROG = { net: tA.net + tB.net, tva: tA.tva + tB.tva, ttc: tA.ttc + tB.ttc };

const recapLignes = [
  ['Phase 1 — Fournitures et composants (PRO-2026-014/A)', tA.ttc],
  ['Phase 2 — Prestations de remise en état (PRO-2026-014/B)', tB.ttc],
];

/* ============================ WORD ============================ */
const noB = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};
const W = { num: 600, des: 5200, qte: 700, pu: 1600, mt: 1800 };
const TW = W.num + W.des + W.qte + W.pu + W.mt;

const p = (t, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.LEFT,
  spacing: { before: o.before || 0, after: o.after === undefined ? 60 : o.after },
  children: [new TextRun({ text: t, bold: !!o.bold, italics: !!o.it, size: o.size || 20,
    color: o.color || '000000', font: 'Calibri' })],
});

const cell = (t, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
  verticalAlign: VerticalAlign.CENTER, columnSpan: o.span,
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  children: (Array.isArray(t) ? t : [t]).map((x, i) => new Paragraph({
    alignment: o.align || AlignmentType.LEFT, spacing: { after: 0 },
    children: [new TextRun({ text: x, bold: !!o.bold, italics: i > 0 || !!o.it,
      size: i > 0 ? 16 : (o.size || 18),
      color: i > 0 ? '595959' : (o.color || '000000'), font: 'Calibri' })],
  })),
});

function buildDocx(spec, t) {
  const rows = [new TableRow({ tableHeader: true, children: [
    cell('N°', { w: W.num, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.CENTER }),
    cell('Désignation', { w: W.des, fill: NAVY, color: 'FFFFFF', bold: true }),
    cell('Qté', { w: W.qte, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.CENTER }),
    cell('P.U. HT', { w: W.pu, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.RIGHT }),
    cell('Montant HT', { w: W.mt, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.RIGHT }),
  ]})];
  let n = 0;
  spec.sections.forEach(sec => {
    rows.push(new TableRow({ children: [new TableCell({
      width: { size: TW, type: WidthType.DXA }, columnSpan: 5,
      shading: { type: ShadingType.CLEAR, fill: GREY, color: 'auto' },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ spacing: { after: 0 }, children: [
        new TextRun({ text: sec.titre, bold: true, size: 18, color: NAVY, font: 'Calibri' })] })],
    })]}));
    sec.lignes.forEach(l => { n++;
      rows.push(new TableRow({ children: [
        cell(String(n), { w: W.num, align: AlignmentType.CENTER }),
        cell([l.d, ...l.s], { w: W.des, bold: true }),
        cell(String(l.q), { w: W.qte, align: AlignmentType.CENTER }),
        cell(fmt(l.pu), { w: W.pu, align: AlignmentType.RIGHT }),
        cell(fmt(l.q * l.pu), { w: W.mt, align: AlignmentType.RIGHT, bold: true }),
      ]}));
    });
  });
  const totRow = (lab, val, o = {}) => new TableRow({ children: [
    new TableCell({ width: { size: W.num + W.des + W.qte, type: WidthType.DXA }, columnSpan: 3,
      borders: noB, children: [new Paragraph({ spacing: { after: 0 }, children: [] })] }),
    cell(lab, { w: W.pu, bold: true, align: AlignmentType.RIGHT, fill: o.fill || LIGHT, color: o.color }),
    cell(val, { w: W.mt, bold: true, align: AlignmentType.RIGHT, fill: o.fill || LIGHT, color: o.color, size: o.size }),
  ]});
  rows.push(totRow('TOTAL HT', fmt(t.ht)));
  if (spec.remisePct) {
    rows.push(totRow('Remise commerciale ' + spec.remisePct + ' %', '- ' + fmt(t.remise)));
    rows.push(totRow('NET HT', fmt(t.net)));
  }
  rows.push(totRow('TVA ' + TVA + ' %', fmt(t.tva)));
  rows.push(totRow('TOTAL TTC (FCFA)', fmt(t.ttc), { fill: NAVY, color: 'FFFFFF', size: 22 }));

  const OW = { d: 6500, v: 3400 };
  const optTable = new Table({
    columnWidths: [OW.d, OW.v], width: { size: OW.d + OW.v, type: WidthType.DXA },
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell('Option (non incluse dans le total ci-dessus)', { w: OW.d, fill: NAVY, color: 'FFFFFF', bold: true }),
        cell('Prix HT (FCFA)', { w: OW.v, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.RIGHT }),
      ]}),
      ...spec.options.map(([d, v]) => new TableRow({ children: [
        cell(d, { w: OW.d }), cell(fmt(v), { w: OW.v, align: AlignmentType.RIGHT, bold: true }),
      ]})),
    ],
  });

  const recapTable = new Table({
    columnWidths: [7100, 2800], width: { size: 9900, type: WidthType.DXA },
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell('Rappel du programme en deux phases', { w: 7100, fill: GREY, color: NAVY, bold: true }),
        cell('Montant TTC', { w: 2800, fill: GREY, color: NAVY, bold: true, align: AlignmentType.RIGHT }),
      ]}),
      ...recapLignes.map(([d, v]) => new TableRow({ children: [
        cell(d, { w: 7100, bold: d.indexOf(spec.ref) >= 0 }),
        cell(fmt(v), { w: 2800, align: AlignmentType.RIGHT, bold: true }),
      ]})),
      new TableRow({ children: [
        cell('TOTAL DU PROGRAMME', { w: 7100, fill: NAVY, color: 'FFFFFF', bold: true }),
        cell(fmt(PROG.ttc), { w: 2800, fill: NAVY, color: 'FFFFFF', bold: true, align: AlignmentType.RIGHT }),
      ]}),
    ],
  });

  const header = new Table({
    columnWidths: [5400, 4500], width: { size: 9900, type: WidthType.DXA },
    borders: { top: noB.top, bottom: noB.bottom, left: noB.left, right: noB.right,
      insideHorizontal: noB.top, insideVertical: noB.left },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 5400, type: WidthType.DXA }, borders: noB,
        margins: { top: 0, bottom: 0, left: 0, right: 120 }, children: [
        p('[VOTRE SOCIÉTÉ]', { bold: true, size: 26, color: NAVY }),
        p('Maintenance électronique et instrumentation industrielle', { size: 17, it: true, color: '595959' }),
        p('[Adresse — Zone industrielle, Abidjan]', { size: 17 }),
        p('Tél. : [+225 XX XX XX XX XX]', { size: 17 }),
        p('E-mail : thortechnologie@gmail.com', { size: 17 }),
        p('RCCM : [N°] — CC : [N° Compte Contribuable]', { size: 17 }),
      ]}),
      new TableCell({ width: { size: 4500, type: WidthType.DXA }, borders: noB,
        shading: { type: ShadingType.CLEAR, fill: LIGHT, color: 'auto' },
        margins: { top: 140, bottom: 140, left: 160, right: 160 }, children: [
        p('CLIENT', { bold: true, size: 16, color: NAVY }),
        p('ATINKOU', { bold: true, size: 22 }),
        p('[Centrale thermique — Jacqueville, Côte d’Ivoire]', { size: 17 }),
        p('À l’attention de : [Nom du destinataire]', { size: 17 }),
        p('Service : Maintenance / Instrumentation', { size: 17 }),
      ]}),
    ]})],
  });

  return new Document({
    creator: 'Board Doctor', title: 'Devis proforma ' + spec.ref + ' — ATINKOU',
    sections: [{
      properties: { page: { margin: { top: 900, right: 1000, bottom: 900, left: 1000 } } },
      children: [
        header,
        new Paragraph({ spacing: { after: 200 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 6 } },
          children: [new TextRun({ text: 'DEVIS PROFORMA', bold: true, size: 34, color: NAVY, font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 30 }, children: [
          new TextRun({ text: spec.phase, bold: true, size: 20, color: ACCENT, font: 'Calibri' })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 180 }, children: [
          new TextRun({ text: 'N° ' + spec.ref + '   ·   Abidjan, le 14 septembre 2026   ·   Validité : voir conditions',
            size: 18, color: '595959', font: 'Calibri' })] }),
        p(spec.objet, { bold: true, size: 20, color: NAVY, after: 80 }),
        p(spec.intro, { size: 19, after: 200 }),
        new Table({ columnWidths: [W.num, W.des, W.qte, W.pu, W.mt],
          width: { size: TW, type: WidthType.DXA }, rows }),
        new Paragraph({ spacing: { after: 120 }, children: [] }),
        p('Arrêté le présent devis proforma à la somme de : ' + fmt(t.ttc) + ' FCFA TTC.',
          { bold: true, size: 20, color: ACCENT, after: 200 }),
        recapTable,
        new Paragraph({ children: [new PageBreak()] }),
        p(spec.optTitre, { bold: true, size: 20, color: NAVY, after: 100 }),
        p(spec.optIntro, { size: 18, it: true, after: 120 }),
        optTable,
        new Paragraph({ spacing: { after: 260 }, children: [] }),
        p('CONDITIONS COMMERCIALES ET TECHNIQUES', { bold: true, size: 20, color: NAVY, after: 100 }),
        ...spec.conditions.map(([k, v]) => new Paragraph({ spacing: { after: 90 }, children: [
          new TextRun({ text: k + ' : ', bold: true, size: 18, color: NAVY, font: 'Calibri' }),
          new TextRun({ text: v, size: 18, font: 'Calibri' }),
        ]})),
        new Paragraph({ spacing: { after: 320 }, children: [] }),
        new Table({ columnWidths: [4950, 4950], width: { size: 9900, type: WidthType.DXA },
          borders: { top: noB.top, bottom: noB.bottom, left: noB.left, right: noB.right,
            insideHorizontal: noB.top, insideVertical: noB.left },
          rows: [new TableRow({ children: [
            new TableCell({ width: { size: 4950, type: WidthType.DXA }, borders: noB, children: [
              p('Pour le client — ATINKOU', { bold: true, size: 18 }),
              p('« Bon pour accord », date, cachet et signature', { size: 16, it: true, color: '595959', after: 700 }),
              new Paragraph({ spacing: { after: 0 },
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: '808080', space: 4 } }, children: [] }),
            ]}),
            new TableCell({ width: { size: 4950, type: WidthType.DXA }, borders: noB, margins: { left: 300 }, children: [
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
}

/* ============================ HTML ============================ */
function buildHtml(spec, t) {
  let n = 0, body = '';
  spec.sections.forEach(sec => {
    body += `<tr class="sec"><td colspan="5">${sec.titre}</td></tr>`;
    sec.lignes.forEach(l => { n++;
      body += `<tr><td class="c">${n}</td><td><b>${l.d}</b><div class="sub">${l.s.join('<br>')}</div></td>` +
              `<td class="c">${l.q}</td><td class="r">${fmtH(l.pu)}</td><td class="r b">${fmtH(l.q*l.pu)}</td></tr>`;
    });
  });
  let tot = `<tr class="tot"><td style="width:66%;border:none"></td><td class="lbl" style="width:16%">TOTAL HT</td><td class="val" style="width:18%">${fmtH(t.ht)}</td></tr>`;
  if (spec.remisePct) {
    tot += `<tr class="tot"><td style="border:none"></td><td class="lbl">Remise commerciale ${spec.remisePct} %</td><td class="val">-&nbsp;${fmtH(t.remise)}</td></tr>`;
    tot += `<tr class="tot"><td style="border:none"></td><td class="lbl">NET HT</td><td class="val">${fmtH(t.net)}</td></tr>`;
  }
  tot += `<tr class="tot"><td style="border:none"></td><td class="lbl">TVA ${TVA} %</td><td class="val">${fmtH(t.tva)}</td></tr>`;
  tot += `<tr class="tot grand"><td style="border:none"></td><td class="lbl">TOTAL TTC (FCFA)</td><td class="val">${fmtH(t.ttc)}</td></tr>`;

  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Proforma ${spec.ref} ATINKOU</title><style>
@page { size: A4; margin: 14mm 13mm; }
* { box-sizing: border-box; }
body { font-family: Calibri, "Segoe UI", Arial, sans-serif; font-size: 9.5pt; color: #000; margin: 0; }
.head { display: flex; gap: 14px; }
.emit { flex: 1.25; } .emit .name { font-size: 15pt; font-weight: 700; color: #1F3864; }
.emit .tag { font-style: italic; color: #595959; margin-bottom: 5px; }
.emit div { font-size: 8.5pt; line-height: 1.45; }
.cli { flex: 1; background: #FAFAFA; padding: 9px 11px; }
.cli .lbl { font-size: 8pt; font-weight: 700; color: #1F3864; letter-spacing: .4px; }
.cli .nom { font-size: 13pt; font-weight: 700; margin: 2px 0 3px; }
.cli div { font-size: 8.5pt; line-height: 1.45; }
h1 { text-align: center; font-size: 19pt; color: #1F3864; margin: 16px 0 2px;
     border-bottom: 2px solid #1F3864; padding-bottom: 4px; letter-spacing: 1px; }
.phase { text-align: center; font-weight: 700; color: #C00000; font-size: 10.5pt; margin-top: 5px; }
.meta { text-align: center; font-size: 9pt; color: #595959; margin: 3px 0 12px; }
.objet { font-weight: 700; color: #1F3864; font-size: 10pt; margin-bottom: 4px; }
.intro { font-size: 9.5pt; text-align: justify; margin-bottom: 10px; }
table { width: 100%; border-collapse: collapse; }
table.det th { background: #1F3864; color: #fff; font-size: 9pt; padding: 6px 5px; text-align: left; }
table.det td { border-bottom: 1px solid #D9D9D9; padding: 5px; font-size: 9pt; vertical-align: middle; }
.sub { font-size: 7.8pt; color: #595959; line-height: 1.4; margin-top: 2px; }
tr.sec td { background: #F2F2F2; font-weight: 700; color: #1F3864; font-size: 9pt; }
.c { text-align: center; } .r { text-align: right; white-space: nowrap; } .b { font-weight: 700; }
.tot td { padding: 5px; font-weight: 700; font-size: 9.5pt; }
.tot td.lbl, .tot td.val { text-align: right; background: #FAFAFA; white-space: nowrap; }
.tot.grand td { background: #1F3864; color: #fff; font-size: 11.5pt; padding: 8px 5px; }
.arrete { font-weight: 700; color: #C00000; font-size: 10pt; margin: 10px 0 14px; }
table.rec th { background: #F2F2F2; color: #1F3864; font-size: 9pt; padding: 6px 5px; text-align: left; }
table.rec td { border-bottom: 1px solid #D9D9D9; padding: 5px; font-size: 9pt; }
table.rec tr.g td { background: #1F3864; color: #fff; font-weight: 700; }
h2 { font-size: 10.5pt; color: #1F3864; margin: 0 0 5px; }
table.opt th { background: #1F3864; color: #fff; font-size: 9pt; padding: 6px 5px; text-align: left; }
table.opt td { border-bottom: 1px solid #D9D9D9; padding: 5px; font-size: 9pt; }
.cond p { margin: 0 0 5px; font-size: 9pt; text-align: justify; } .cond b { color: #1F3864; }
.sig { display: flex; gap: 40px; margin-top: 34px; } .sig > div { flex: 1; }
.sig .t { font-weight: 700; font-size: 9pt; } .sig .s { font-style: italic; color: #595959; font-size: 8.5pt; }
.sig .line { border-top: 1px solid #808080; margin-top: 52px; }
.pb { page-break-before: always; }
</style></head><body>
<div class="head">
  <div class="emit">
    <div class="name">[VOTRE SOCIÉTÉ]</div>
    <div class="tag">Maintenance électronique et instrumentation industrielle</div>
    <div>[Adresse — Zone industrielle, Abidjan]</div>
    <div>Tél. : [+225 XX XX XX XX XX]</div>
    <div>E-mail : thortechnologie@gmail.com</div>
    <div>RCCM : [N°] — CC : [N° Compte Contribuable]</div>
  </div>
  <div class="cli">
    <div class="lbl">CLIENT</div><div class="nom">ATINKOU</div>
    <div>[Centrale thermique — Jacqueville, Côte d’Ivoire]</div>
    <div>À l’attention de : [Nom du destinataire]</div>
    <div>Service : Maintenance / Instrumentation</div>
  </div>
</div>
<h1>DEVIS PROFORMA</h1>
<div class="phase">${spec.phase}</div>
<div class="meta">N° ${spec.ref} &nbsp;·&nbsp; Abidjan, le 14 septembre 2026 &nbsp;·&nbsp; Validité : voir conditions</div>
<div class="objet">${spec.objet}</div>
<div class="intro">${spec.intro}</div>
<table class="det">
<thead><tr><th style="width:6%" class="c">N°</th><th style="width:53%">Désignation</th>
<th style="width:7%" class="c">Qté</th><th style="width:16%" class="r">P.U. HT</th><th style="width:18%" class="r">Montant HT</th></tr></thead>
<tbody>${body}</tbody></table>
<table style="margin-top:8px">${tot}</table>
<div class="arrete">Arrêté le présent devis proforma à la somme de : ${fmtH(t.ttc)} FCFA TTC.</div>
<table class="rec">
<thead><tr><th style="width:74%">Rappel du programme en deux phases</th><th style="width:26%" class="r">Montant TTC</th></tr></thead>
<tbody>${recapLignes.map(([d,v]) => `<tr><td${d.indexOf(spec.ref)>=0?' class="b"':''}>${d}</td><td class="r b">${fmtH(v)}</td></tr>`).join('')}
<tr class="g"><td>TOTAL DU PROGRAMME</td><td class="r">${fmtH(PROG.ttc)}</td></tr></tbody></table>
<div class="pb"></div>
<h2>${spec.optTitre}</h2>
<div class="intro" style="font-style:italic">${spec.optIntro}</div>
<table class="opt">
<thead><tr><th style="width:72%">Option (non incluse dans le total ci-dessus)</th><th style="width:28%" class="r">Prix HT (FCFA)</th></tr></thead>
<tbody>${spec.options.map(([d,v]) => `<tr><td>${d}</td><td class="r b">${fmtH(v)}</td></tr>`).join('')}</tbody></table>
<h2 style="margin-top:22px">CONDITIONS COMMERCIALES ET TECHNIQUES</h2>
<div class="cond">${spec.conditions.map(([k,v]) => `<p><b>${k} :</b> ${v}</p>`).join('')}</div>
<div class="sig">
  <div><div class="t">Pour le client — ATINKOU</div><div class="s">« Bon pour accord », date, cachet et signature</div><div class="line"></div></div>
  <div><div class="t">Pour [VOTRE SOCIÉTÉ]</div><div class="s">Le Responsable technique</div><div class="line"></div></div>
</div></body></html>`;
}

/* ============================ SORTIE ============================ */
const jobs = [
  { spec: A, t: tA, base: 'Proforma_ATINKOU_014A_Fournitures' },
  { spec: B, t: tB, base: 'Proforma_ATINKOU_014B_Prestations' },
];
Promise.all(jobs.map(j => {
  fs.writeFileSync(j.base + '.html', buildHtml(j.spec, j.t));
  return Packer.toBuffer(buildDocx(j.spec, j.t)).then(b => fs.writeFileSync(j.base + '.docx', b));
})).then(() => {
  console.log('PHASE 1 — HT', fmt(tA.ht), '| TVA', fmt(tA.tva), '| TTC', fmt(tA.ttc));
  console.log('PHASE 2 — HT', fmt(tB.ht), '| remise', fmt(tB.remise), '| net', fmt(tB.net), '| TVA', fmt(tB.tva), '| TTC', fmt(tB.ttc));
  console.log('PROGRAMME — net HT', fmt(PROG.net), '| TVA', fmt(PROG.tva), '| TTC', fmt(PROG.ttc));
});
