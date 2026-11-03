import type { WorkspaceState } from '@/types'
import metrics from './metrics.json'
import workspace from './workspace.json'

// Bundled sample workspace: the fallback for first load, corrupt storage and "Reset to sample".
export function sampleWorkspace(): WorkspaceState {
  return structuredClone({ ...metrics, ...workspace }) as unknown as WorkspaceState
}
