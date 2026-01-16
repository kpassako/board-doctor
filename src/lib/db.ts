import Dexie, { Table } from 'dexie'
import { Diagnostic } from '../types'

export class DiagnosticDatabase extends Dexie {
  diagnostics!: Table<Diagnostic, string>

  constructor() {
    super('DiagnosticDatabase')
    this.version(1).stores({
      diagnostics: 'id, title, deviceType, status, createdAt, updatedAt'
    })
  }
}

export const db = new DiagnosticDatabase()

export async function saveDiagnostic(diagnostic: Diagnostic): Promise<string> {
  return await db.diagnostics.put(diagnostic)
}

export async function getDiagnostic(id: string): Promise<Diagnostic | undefined> {
  return await db.diagnostics.get(id)
}

export async function getAllDiagnostics(): Promise<Diagnostic[]> {
  return await db.diagnostics.toArray()
}

export async function deleteDiagnostic(id: string): Promise<void> {
  await db.diagnostics.delete(id)
}

export async function updateDiagnostic(id: string, changes: Partial<Diagnostic>): Promise<number> {
  return await db.diagnostics.update(id, {
    ...changes,
    updatedAt: new Date().toISOString()
  })
}
