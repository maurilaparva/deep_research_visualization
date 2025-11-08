import { type Message } from 'ai'
import {Node as ReactFlowNode, Edge as ReactFlowEdge} from 'reactflow'
import { type Message } from 'ai'
import { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow'

export type ConstraintType = 'evidence' | 'scope' | 'comparisons'
export type MetricType = 'depth' | 'breadth' | 'coherence' | 'relevance'

export interface PromptAnalysis {
  intent: 'exploratory' | 'analytical' | 'comparative'
  constraints: Record<ConstraintType, boolean>
  metrics: Record<MetricType, number>
  suggestions: string[]
}

export interface PromptVersion {
  id: string
  text: string
  analysis: PromptAnalysis
  response?: string
  quality?: {
    depth: number
    coherence: number
    relevance: number
  }
}

export interface PromptFlow {
  nodes: ReactFlowNode[] // Represents prompt versions
  edges: ReactFlowEdge[] // Represents refinement relationships
}

export interface PromptState {
  history: PromptVersion[]
  current: PromptVersion | null
  flow: PromptFlow
}

// Existing types kept for compatibility
export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  messages: Message[]
}

export type ServerActionResult<R> = Promise<R | { error: string }>

export interface Recommendation {
  id: number
  text: string
}

export interface BackendData {
  data: {
    recommendation: Recommendation[]
    vis_res: { nodes: KGNode[]; edges: KGEdge[] }
    node_name_mapping: { [KGName: string]: string } // naming KG name to GPT name
  }
  keywords_list_answer: string[]
  keywords_list_question: string[]
  message: string
  status: string
}
