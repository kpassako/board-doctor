export interface Component {
  id: string
  reference: string
  name: string
  type: 'resistor' | 'capacitor' | 'ic' | 'mosfet' | 'diode' | 'inductor'
  value: string
  status: 'unknown' | 'good' | 'suspect' | 'faulty'
  notes?: string
}

export interface Board {
  id: string
  name: string
  manufacturer: string
  model: string
  components: Component[]
  voltageRails: VoltageRail[]
  createdAt: string
  updatedAt: string
}

export interface Measurement {
  id: string
  componentId: string
  point: string
  value: number
  unit: string
  timestamp: string
  expected?: number
  tolerance?: number
}

export interface VoltageRail {
  id: string
  name: string
  expectedVoltage: number
  tolerance: number
  testPoints: string[]
  color?: string
}

export interface Diagnostic {
  id: string
  boardId: string
  title: string
  deviceType: string
  createdAt: string
  updatedAt: string
  components: Component[]
  measurements: Measurement[]
  voltageRails: VoltageRail[]
  notes: string
  status: 'in-progress' | 'completed' | 'archived'
  photos: string[]
}
