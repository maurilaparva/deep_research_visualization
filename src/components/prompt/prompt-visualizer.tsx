import React, { useMemo } from 'react'
import { Handle, Position } from 'reactflow'
import { PromptVersion } from '../../lib/types'
import { ConstraintBadges } from './constraint-badges'

interface PromptNodeProps {
  data: {
    prompt: PromptVersion
  }
}

export function PromptNode({ data }: PromptNodeProps) {
  const { prompt } = data
  const metrics = prompt.quality || prompt.analysis.metrics

  // Calculate overall quality score
  const qualityScore = useMemo(() => {
    if (!metrics) return 0
    const values = Object.values(metrics)
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }, [metrics])

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-[300px]">
      <Handle type="target" position={Position.Left} />
      
      {/* Prompt Text */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-3">{prompt.text}</p>
      </div>

      {/* Quality Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quality Score</span>
          <span className="text-sm">{Math.round(qualityScore * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full rounded-full"
            style={{
              width: `${qualityScore * 100}%`,
              backgroundColor: `hsl(${qualityScore * 120}, 70%, 45%)`
            }}
          />
        </div>
      </div>

      {/* Constraints */}
      <div className="mt-3">
        <ConstraintBadges constraints={prompt.analysis.constraints} />
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}

interface PromptEdgeProps {
  data?: {
    improvements?: string[]
  }
}

export function PromptEdge({ data }: PromptEdgeProps) {
  return (
    <>
      <div className="prompt-edge-improvements">
        {data?.improvements?.map((improvement, i) => (
          <div key={i} className="text-xs bg-blue-50 p-1 rounded">
            {improvement}
          </div>
        ))}
      </div>
    </>
  )
}

// Export custom node and edge types
export const nodeTypes = {
  promptNode: PromptNode
}

export const edgeTypes = {
  promptEdge: PromptEdge
}