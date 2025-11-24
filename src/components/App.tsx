'use client'

import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'

// Local Components
import { PromptAnalyzer } from '../components/prompt/prompt-analyzer'
import { Button } from './ui/button'

// State + Utils
import { promptStateAtom, currentPromptAtom } from '../lib/prompt-state'
import { analyzePrompt } from '../lib/prompt-analysis'
import { PromptVersion, ConstraintType, MetricType } from '../lib/types'

const __tailwind_keep = [
  'bg-stone-200',
  'bg-stone-800',
  'bg-neutral-200',
  'bg-neutral-800',
  'h-2',
  'rounded-full',
  'overflow-hidden'
]

interface AppProps {
  initialPrompt?: string
}

export function App({ initialPrompt }: AppProps) {
  return <AppContent initialPrompt={initialPrompt} />
}

function AppContent({ initialPrompt }: AppProps) {
  const [promptState, setPromptState] = useAtom(promptStateAtom)
  const [, setCurrentPrompt] = useAtom(currentPromptAtom)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const skipAutoSelect = (promptState as any).skipAutoSelect || false

  const history = promptState.history || []
  const hasHistory = history.length > 0
  const activePrompt: PromptVersion | null =
    hasHistory && activeIndex >= 0 && activeIndex < history.length
      ? history[activeIndex]
      : null

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

  useEffect(() => {
    if (!skipAutoSelect) {
      if (history.length > 0) setActiveIndex(history.length - 1)
      else setActiveIndex(0)
    }
  }, [history.length, skipAutoSelect])

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
          suggestions: [
            'Specify domains or populations',
            'Add explicit comparison targets to increase focus'
          ]
        }
      },
      {
        text: 'Compare systematic review methods vs AI-assisted literature reviews for interdisciplinary topics',
        analysis: {
          intent: 'comparative',
          constraints: { evidence: true, scope: true, comparisons: true },
          metrics: { depth: 0.8, breadth: 0.7, coherence: 0.8, relevance: 0.85 },
          suggestions: [
            'Clarify evaluation metrics for comparison (coverage, speed, reproducibility)'
          ]
        }
      }
    ]

    setPromptState({
      history: [],
      current: null,
      flow: { nodes: [], edges: [] },
      skipAutoSelect: true
    })

    demo.forEach((d) => {
      const newPrompt: PromptVersion = {
        id: uuidv4(),
        text: d.text,
        analysis: d.analysis as any
      }
      setCurrentPrompt(newPrompt)
    })

    setTimeout(() => {
      setActiveIndex(0)
      setPromptState((s: any) => ({ ...s, skipAutoSelect: false }))
    }, 50)

    toast('Demo loaded', { icon: '🧪' })
  }

  const handlePrev = () =>
    hasHistory && setActiveIndex((prev) => Math.max(0, prev - 1))

  const handleNext = () =>
    hasHistory && setActiveIndex((prev) => Math.min(history.length - 1, prev + 1))

  return (
    <div className="relative h-screen font-sans text-base leading-relaxed tracking-tight flex">
      {/* TAILWIND PURGE FIX */}
      <div className="hidden bg-neutral-800 bg-neutral-200"></div>

      {/* LEFT PANEL */}
      <div className="w-[320px] p-4 border-r bg-white shadow-md z-10 flex flex-col rounded-br-lg">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Prompt Workspace
          </h1>

          <Button size="sm" variant="ghost" onClick={loadDemoPrompts}>
            Load Demo
          </Button>
        </div>

        <PromptAnalyzer isAnalyzing={isAnalyzing} onPromptSubmit={handlePromptSubmit} />
      </div>

      {/* RIGHT PANEL — IMPORTANT: FIXED LEFT OFFSET */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Prompt Versions</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Browse and compare iterations of your research prompt.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrev}
              disabled={!hasHistory || activeIndex === 0}
            >
              ← Previous
            </Button>

            <span className="text-xs text-muted-foreground">
              {hasHistory ? `v${activeIndex + 1} of v${history.length}` : 'No versions yet'}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNext}
              disabled={!hasHistory || activeIndex === history.length - 1}
            >
              Next →
            </Button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            {activePrompt ? (
              <PromptCard
                prompt={activePrompt}
                index={activeIndex}
                total={history.length}
                history={history}
              />
            ) : (
              <EmptyState />
            )}
          </div>

          {/* MINI PROMPT GRAPH */}
          <MiniPromptGraph
            history={history}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />

          {/* TIMELINE */}
          <PromptTimeline
            history={history}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        </div>
      </div>

      {/* TAILWIND KEEP FIX */}
      <div
        className="
        hidden
        bg-stone-200 bg-stone-800 
        bg-neutral-200 bg-neutral-800 
        h-2 rounded-full overflow-hidden
      "
      />
    </div>
  )
}

/* -------------------------------------------
FLASHCARD
-------------------------------------------- */

interface PromptCardProps {
  prompt: PromptVersion
  index: number
  total: number
  history: PromptVersion[]
}

function PromptCard({ prompt, index, total, history }: PromptCardProps) {
  const analysis = prompt.analysis
  const metrics: MetricType[] = ['depth', 'breadth', 'coherence', 'relevance']
  const constraints: ConstraintType[] = ['evidence', 'scope', 'comparisons']

  // ---- Helpers
  const getMetricVector = (p?: PromptVersion | null): number[] | null => {
    const m = p?.analysis?.metrics
    if (!m) return null
    return metrics.map((k) => m[k] ?? 0)
  }

  const currentVec = getMetricVector(prompt)

  // Best version score
  let bestIndex = -1
  let bestScore = -Infinity

  history.forEach((p, i) => {
    const v = getMetricVector(p)
    if (!v) return
    const avg = v.reduce((a, b) => a + b, 0) / v.length
    if (avg > bestScore) {
      bestScore = avg
      bestIndex = i
    }
  })

  const isBest = bestIndex === index
  const bestScorePercent = bestScore > -Infinity ? Math.round(bestScore * 100) : null

  // Similarity
  let mostSimilarIndex = -1
  let bestSim = -1

  if (currentVec) {
    history.forEach((p, i) => {
      if (i === index) return
      const v = getMetricVector(p)
      if (!v) return

      let sumDiff = 0
      for (let j = 0; j < currentVec.length; j++) {
        sumDiff += Math.abs(currentVec[j] - v[j])
      }

      const sim = 1 - sumDiff / currentVec.length
      if (sim > bestSim) {
        bestSim = sim
        mostSimilarIndex = i
      }
    })
  }

  const similarityPercent = bestSim >= 0 ? Math.round(bestSim * 100) : null
  const prevPrompt = index > 0 ? history[index - 1] : null
  const prevMetrics = prevPrompt?.analysis?.metrics

  return (
    <div
      key={prompt.id}
      className="animate-fadeIn w-full max-w-3xl rounded-xl border bg-card shadow-sm px-6 py-5 flex flex-col gap-4"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="px-2 py-0.5 rounded-full border bg-neutral-100">
              Version {index + 1} of {total}
            </span>
            {analysis?.intent && (
              <span className="px-2 py-0.5 rounded-full bg-black text-white">
                {analysis.intent}
              </span>
            )}
          </div>

          {/* Best version */}
          {bestIndex !== -1 && bestScorePercent !== null && (
            <div className="mt-1 text-xs text-muted-foreground">
              {isBest ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                  <span>🏆</span>
                  <span>Best version so far (score {bestScorePercent}%)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-50 border">
                  <span>🏆</span>
                  <span>
                    Best so far: v{bestIndex + 1} (score {bestScorePercent}%)
                  </span>
                </span>
              )}
            </div>
          )}

          <h3 className="text-sm font-medium text-foreground mt-2">Current Prompt</h3>
        </div>
      </div>

      {/* TEXT */}
      <div className="rounded-lg bg-neutral-100 border px-3 py-2 max-h-40 overflow-auto text-sm leading-snug">
        {prompt.text}
      </div>

      {/* SIMILARITY */}
      {similarityPercent !== null && mostSimilarIndex !== -1 && (
        <div className="text-xs text-muted-foreground">
          Most similar to <span className="font-medium">v{mostSimilarIndex + 1}</span> (
          {similarityPercent}% match)
        </div>
      )}

      {/* METRICS + CONSTRAINTS */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* METRICS */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-2">
              Quality Metrics
            </h4>

            <div className="space-y-3">
              {metrics.map((key) => {
                const value = analysis.metrics[key] ?? 0
                const percent = Math.round(value * 100)

                const prevValue = prevMetrics ? prevMetrics[key] : undefined
                let deltaPercent: number | null = null
                let arrow: string | null = null

                if (typeof prevValue === 'number') {
                  const diffPercent = Math.round((value - prevValue) * 100)
                  if (diffPercent !== 0) {
                    deltaPercent = diffPercent
                    arrow = diffPercent > 0 ? '▲' : '▼'
                  }
                }

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{key}</span>
                      <span>
                        {percent}%{' '}
                        {arrow && deltaPercent !== null && (
                          <span
                            className={`ml-1 ${
                              deltaPercent > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {arrow} {deltaPercent > 0 ? `+${deltaPercent}` : deltaPercent}
                          </span>
                        )}
                      </span>
                    </div>

                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#e7e5e4' }}
                    >
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${value * 100}%`,
                          backgroundColor: '#292524'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CONSTRAINTS */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-2">
              Constraints
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {constraints.map((key) => {
                const enabled = analysis.constraints[key]
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 rounded-md border px-2 py-1 bg-background"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        enabled ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="capitalize">{key}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUGGESTIONS */}
      {analysis?.suggestions?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-2">
            Suggestions for Refinement
          </h4>
          <ul className="space-y-1.5 text-sm list-disc list-inside">
            {analysis.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------
MINI PROMPT GRAPH
-------------------------------------------- */

interface MiniPromptGraphProps {
  history: PromptVersion[]
  activeIndex: number
  onSelect: (index: number) => void
}

function MiniPromptGraph({ history, activeIndex, onSelect }: MiniPromptGraphProps) {
  if (!history.length) return null

  return (
    <div className="mt-4 border-t pt-3 w-full">
      <span className="text-xs font-medium text-muted-foreground">Prompt Graph</span>

      <div className="mt-3 w-full flex justify-center">
        <div className="flex items-start gap-3 overflow-x-auto pb-2 px-2">
          {history.map((p, index) => {
            const isActive = index === activeIndex
            const analysis = p.analysis
            const suggestions = analysis?.suggestions || []

            return (
              <div key={p.id} className="flex items-start">
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className={
                    `flex flex-col items-stretch text-xs rounded-lg px-3 py-2 min-w-[120px] max-w-[160px] text-left transition-all border ` +
                    (isActive
                      ? 'bg-black text-white border-black shadow-lg scale-[1.02]'
                      : 'bg-white text-black border-neutral-200 hover:border-neutral-400')
                  }
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">v{index + 1}</span>
                    {analysis?.intent && (
                      <span className={
                        `px-1.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.12em] ` +
                        (isActive
                          ? 'bg-white text-black'
                          : 'bg-neutral-100 text-neutral-600')
                      }>
                        {analysis.intent}
                      </span>
                    )}
                  </div>

                  {suggestions.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {suggestions.slice(0, 2).map((s, i) => (
                        <div
                          key={i}
                          className={
                            `rounded-md border px-2 py-0.5 text-[10px] leading-snug ` +
                            (isActive
                              ? 'bg-white/20 border-white text-white'
                              : 'bg-neutral-50 border-neutral-200 text-black')
                          }
                        >
                          {s}
                        </div>
                      ))}

                      {suggestions.length > 2 && (
                        <div className={
                          `text-[10px] mt-0.5 ` +
                          (isActive ? 'text-white/80' : 'text-neutral-500')
                        }>
                          +{suggestions.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>

                {index < history.length - 1 && (
                  <div
                    className={
                      `flex items-center mx-1 text-xs shrink-0 ` +
                      (isActive ? 'text-black' : 'text-neutral-400')
                    }
                  >
                    →
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


/* -------------------------------------------
TIMELINE
-------------------------------------------- */

interface PromptTimelineProps {
  history: PromptVersion[]
  activeIndex: number
  onSelect: (index: number) => void
}

function PromptTimeline({ history, activeIndex, onSelect }: PromptTimelineProps) {
  if (!history.length) return null

  return (
    <div className="mt-3 border-t pt-3 w-full">
      <span className="text-xs font-medium text-muted-foreground">Version Timeline</span>

      <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
        {history.map((p, index) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap transition
              ${
                index === activeIndex
                  ? 'bg-black text-white border-black'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
          >
            v{index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------
EMPTY
-------------------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground gap-2">
      <p className="font-medium">No prompt versions yet</p>
      <p className="max-w-sm">
        Start by entering a research prompt on the left and analyzing it, or load the demo prompts.
      </p>
    </div>
  )
}

