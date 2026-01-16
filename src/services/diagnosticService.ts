export interface ComponentDefect {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  location?: string;
  confidence: number;
}

export interface DiagnosticResult {
  id: string;
  timestamp: Date;
  imageName: string;
  imageData: string;
  defects: ComponentDefect[];
  recommendations: string[];
  overallStatus: 'critical' | 'warning' | 'good';
}

export async function analyzeBoardImage(
  imageDataUrl: string,
  imageName: string
): Promise<DiagnosticResult> {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const mockDefects: ComponentDefect[] = [
    {
      type: 'Condensateur bombé',
      severity: 'critical',
      description: 'Condensateur électrolytique présentant un bombement visible',
      location: 'C12 (près du régulateur de tension)',
      confidence: 0.92
    },
    {
      type: 'Trace de brûlure',
      severity: 'warning',
      description: 'Décoloration suspecte sur le circrimé',
      location: 'Zone U3',
      confidence: 0.78
    }
  ];

  const recommendations = [
    'Remplacer le condensateur C12 par un modèle équivalent (1000µF 16V)',
    'Inspecter visuellement la zone U3 pour détecter d\'éventuels courts-circuits',
    'Tester la tension de sortie du régulateur après réparation',
    'Vérifier l\'état des composants adjacents'
  ];

  const result: DiagnosticResult = {
    id: `diag-${Date.now()}`,
    timestamp: new Date(),
    imageName,
    imageData: imageDataUrl,
    defects: mockDefects,
    recommendations,
    overallStatus: mockDefects.some(d => d.severity === 'critical') ? 'critical' : 'warning'
  };

  saveDiagnostic(result);
  return result;
}

export function saveDiagnostic(result: DiagnosticResult): void {
  const history = getDiagnosticHistory();
  history.unshift(result);
  const limited = history.slice(0, 50);
  localStorage.setItem('diagnostic-history', JSON.stringify(limited));
}

export function getDiagnosticHistory(): DiagnosticResult[] {
  const data = localStorage.getItem('diagnostic-history');
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch {
    return [];
  }
}

export function getDiagnosticById(id: string): DiagnosticResult | undefined {
  const history = getDiagnosticHistory();
  return history.find(d => d.id === id);
}

export function deleteDiagnostic(id: string): void {
  const history = getDiagnosticHistory();
  const filtered = history.filter(d => d.id !== id);
  localStorage.setItem('diagnostic-history', JSON.stringify(filtered));
}

export function clearHistory(): void {
  localStorage.removeItem('diagnostic-history');
}

export async function advancedAnalysis(_imageDataUrl: string): Promise<ComponentDefect[]> {
  return [];
}

const diagnosticService = {
  analyzeBoardImage,
  saveDiagnostic,
  getDiagnosticHistory,
  getDiagnosticById,
  deleteDiagnostic,
  clearHistory,
  advancedAnalysis
};

export default diagnosticService;
