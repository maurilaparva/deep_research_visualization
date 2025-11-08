'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useAtom } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'

// Local Components and Types
import { PromptAnalyzer, nodeTypes, edgeTypes } from './prompt'
import { Button } from './ui/button'
import FlowComponent from './vis-flow'

// State and Utils
import { promptStateAtom, currentPromptAtom } from '../lib/prompt-state'
import { analyzePrompt } from '../lib/prompt-analysis'
import { PromptVersion, ConstraintType, MetricType } from '../lib/types'
import { normalizeCategory } from '../lib/utils'

import 'reactflow/dist/style.css'

interface AppProps {
  initialPrompt?: string
}

export function App({ initialPrompt }: AppProps) {
  return (
    <ReactFlowProvider>
      <AppContent initialPrompt={initialPrompt} />
    </ReactFlowProvider>
  )
}

function AppContent({ initialPrompt }: AppProps) {
  // State
  const [promptState, setPromptState] = useAtom(promptStateAtom)
  const [currentPrompt, setCurrentPrompt] = useAtom(currentPromptAtom)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Handlers
  const handlePromptSubmit = async (text: string) => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzePrompt(text)
      
      const newPrompt: PromptVersion = {
        id: uuidv4(),
        text,
        analysis
      }

      setCurrentPrompt(newPrompt)
      toast.success('Prompt analyzed successfully')
    } catch (error) {
      console.error('Failed to analyze prompt:', error)
      toast.error('Failed to analyze prompt')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Callback to update the flow visualization
  const mapSuggestionToType = (s: string) => {
    const t = s.toLowerCase()
    if (t.includes('evidence')) return 'evidence'
    if (t.includes('compare') || t.includes('comparison')) return 'comparison'
    if (t.includes('depth')) return 'depth'
    if (t.includes('breadth')) return 'breadth'
    if (t.includes('specify') || t.includes('domain') || t.includes('population') || t.includes('scope')) return 'scope'
    return 'suggestion'
  }

  const updateFlowVisualization = useCallback(() => {
    if (!promptState.history.length) return
    // Build prompt nodes first
  const PROMPT_X_GAP = 360

    const promptNodes = promptState.history.map((prompt, index) => ({
      id: prompt.id,
      type: 'custom',
      data: { prompt, label: prompt.text?.slice(0, 120) },
      position: { x: index * PROMPT_X_GAP + 80, y: 80 },
      step: index,
      category: normalizeCategory(prompt.text)
    }))

    // Build deduplicated suggestion nodes and edges connecting prompts -> suggestions
  const suggestionMap = new Map<string, { id: string }>()
  const suggestionRefs = new Map<string, number[]>()
  const suggestionNodes: any[] = []
  const promptToSuggestionEdges: any[] = []

    promptState.history.forEach((prompt, pIndex) => {
  const suggs: string[] = prompt.analysis?.suggestions || []
  suggs.forEach((s) => {
        const key = s.trim().toLowerCase()
        if (!suggestionMap.has(key)) {
          const sid = `s-${suggestionMap.size}`
          suggestionMap.set(key, { id: sid })
          suggestionRefs.set(key, [])
          suggestionNodes.push({
            id: sid,
            type: 'custom',
            data: { label: s },
            // placeholder position; we'll compute final x from referencing prompts
            position: { x: 0, y: 300 },
            step: pIndex,
            category: 'Suggestions'
          })
        }

        // record which prompt indices reference this suggestion
        suggestionRefs.get(key)!.push(pIndex)

        const meta = suggestionMap.get(key)!
        promptToSuggestionEdges.push({
          id: `ps-${pIndex}-${meta.id}`,
          source: prompt.id,
          target: meta.id,
          type: 'custom',
          step: pIndex + 1,
          label: mapSuggestionToType(s),
          data: { suggestion: s }
        })
      })
    })

    // Position suggestion nodes based on the average x of referencing prompts
    suggestionNodes.forEach((sn) => {
      // find the key by matching id in suggestionMap
      const entry = Array.from(suggestionMap.entries()).find(([, v]) => v.id === sn.id)
      const key = entry ? entry[0] : undefined
      const refs = key ? suggestionRefs.get(key) || [] : []
      const avgIndex = refs.length ? refs.reduce((a, b) => a + b, 0) / refs.length : 0
      sn.position.x = 80 + avgIndex * PROMPT_X_GAP
      sn.position.y = 320
    })

    // Also keep the original prompt->prompt refinement edges (improvements)
    const refinementEdges = promptState.history.slice(1).map((prompt, index) => ({
      id: `e${index}`,
      source: promptState.history[index].id,
      target: prompt.id,
      type: 'custom',
      step: index + 1,
      data: {
        improvements: getImprovements(
          promptState.history[index],
          prompt
        )
      }
    }))

    const nodes = [...promptNodes, ...suggestionNodes]
    const edges = [...refinementEdges, ...promptToSuggestionEdges]

    setPromptState(prev => ({
      ...prev,
      flow: { nodes, edges }
    }))
  }, [promptState.history, setPromptState])

  // Helper to identify improvements between prompts
  const getImprovements = (prevPrompt: PromptVersion, nextPrompt: PromptVersion) => {
    const improvements: string[] = []
    
    // Compare constraints
    const constraintKeys: ConstraintType[] = ['evidence', 'scope', 'comparisons']
    constraintKeys.forEach(key => {
      if (nextPrompt.analysis.constraints[key] && !prevPrompt.analysis.constraints[key]) {
        improvements.push(`Added ${key} constraint`)
      }
    })

    // Compare metrics
    const metricKeys: MetricType[] = ['depth', 'breadth', 'coherence', 'relevance']
    metricKeys.forEach(key => {
      const prevValue = prevPrompt.analysis.metrics[key]
      const newValue = nextPrompt.analysis.metrics[key]
      if (newValue > prevValue + 0.1) { // 10% improvement threshold
        improvements.push(`Improved ${key}`)
      }
    })

    return improvements
  }

  // Update flow when history changes
  useEffect(() => {
    updateFlowVisualization()
  }, [updateFlowVisualization])

  // Initialize with initial prompt if provided
  useEffect(() => {
    if (initialPrompt && !promptState.history.length) {
      handlePromptSubmit(initialPrompt)
    }
  }, [initialPrompt])

  // Developer helper: load a sequence of demo prompts into the history so the
  // flow visualization can be inspected without a backend model.
  const loadDemoPrompts = () => {
    const demo = [
      {
        text: 'What are current approaches to balancing depth and breadth in interdisciplinary literature reviews?',
        analysis: {
          intent: 'exploratory',
          constraints: { evidence: false, scope: true, comparisons: false },
          metrics: { depth: 0.3, breadth: 0.6, coherence: 0.5, relevance: 0.5 },
          suggestions: ['Add evidence requirements', 'Specify domains or populations']
        }
      },
      {
        text: 'Include temporal constraints and focus on neuroscience literature from 2015-2024',
        analysis: {
          intent: 'analytical',
          constraints: { evidence: true, scope: true, comparisons: false },
          metrics: { depth: 0.6, breadth: 0.5, coherence: 0.6, relevance: 0.7 },
          // share one suggestion with the first prompt to test deduplication
          suggestions: ['Specify domains or populations', 'Add explicit comparison targets to increase focus']
        }
      },
      {
        text: 'Compare systematic review methods vs AI-assisted literature reviews for interdisciplinary topics',
        analysis: {
          intent: 'comparative',
          constraints: { evidence: true, scope: true, comparisons: true },
          metrics: { depth: 0.8, breadth: 0.7, coherence: 0.8, relevance: 0.85 },
          suggestions: ['Clarify evaluation metrics for comparison (coverage, speed, reproducibility)']
        }
      }
    ]

    // Reset history first to avoid accidental duplication when re-loading demo
    setPromptState({ history: [], current: null, flow: { nodes: [], edges: [] } })

    // Append them in order using the currentPromptAtom setter which also
    // pushes into the history (see prompt-state.ts)
    demo.forEach((d) => {
      const newPrompt: PromptVersion = {
        id: uuidv4(),
        text: d.text,
        analysis: d.analysis as any
      }
      setCurrentPrompt(newPrompt)
    })

    toast('Loaded demo prompts into history', { icon: '🧪' })
  }

  return (
    <div className="flex h-screen">
      {/* Left panel - Prompt Analysis */}
      <div className="w-1/3 p-4 border-r">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Deep Research Prompt Refinement</h2>
          <Button size="sm" variant="ghost" onClick={loadDemoPrompts}>
            Load demo prompts
          </Button>
        </div>

        <PromptAnalyzer
          analysis={currentPrompt?.analysis || null}
          isAnalyzing={isAnalyzing}
          onPromptSubmit={handlePromptSubmit}
        />
      </div>

      {/* Right panel - Flow Visualization */}
      <div className="flex-1 p-4">
        <FlowComponent
          nodes={promptState.flow.nodes}
          edges={promptState.flow.edges}
          onNodesChange={() => {}}
          onEdgesChange={() => {}}
          proOptions={{ hideAttribution: true }}
          onConnect={() => {}}
          onInit={() => {}}
          isLoadingBackendData={false}
          isLoading={false}
          setClickedNode={() => {}}
          setLayoutDirection={() => {}}
          updateLayout={() => {}}
          id="prompt-flow"
          append={() => {}}
          activeStep={promptState.history.length}
        />
      </div>
    </div>
  )
}
