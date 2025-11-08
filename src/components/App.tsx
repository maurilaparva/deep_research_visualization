'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ReactFlowProvider } from 'reactflow'
import { useAtom } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'

// Local Components and Types
import { PromptAnalyzer, nodeTypes, edgeTypes } from './prompt'
import FlowComponent from './vis-flow'

// State and Utils
import { promptStateAtom, currentPromptAtom } from '../lib/prompt-state'
import { analyzePrompt } from '../lib/prompt-analysis'
import { PromptVersion, ConstraintType, MetricType } from '../lib/types'

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
  const updateFlowVisualization = useCallback(() => {
    if (!promptState.history.length) return

    const nodes = promptState.history.map((prompt, index) => ({
      id: prompt.id,
      type: 'promptNode',
      data: { prompt },
      position: { x: index * 250, y: 100 }
    }))

    const edges = promptState.history.slice(1).map((prompt, index) => ({
      id: `e${index}`,
      source: promptState.history[index].id,
      target: prompt.id,
      type: 'promptEdge',
      data: {
        improvements: getImprovements(
          promptState.history[index],
          prompt
        )
      }
    }))

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

  return (
    <div className="flex h-screen">
      {/* Left panel - Prompt Analysis */}
      <div className="w-1/3 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Deep Research Prompt Refinement</h2>
        
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
          activeStep={0}
        />
      </div>
    </div>
  )
}
