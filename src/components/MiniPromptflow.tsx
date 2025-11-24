'use client'

import React from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'

import { PromptVersion } from '../lib/types'

interface MiniPromptFlowProps {
  history: PromptVersion[]
}

export default function MiniPromptFlow({ history }: MiniPromptFlowProps) {
  if (!history.length) return null

  // ----------------------------
  // Create nodes for flow
  // ----------------------------
  const nodes = []
  const edges = []

  history.forEach((prompt, i) => {
    const x = i * 200
    const y = 0

    // Main prompt node
    nodes.push({
      id: `prompt-${i}`,
      position: { x, y },
      data: { label: `v${i + 1}` },
      style: {
        padding: 10,
        borderRadius: 8,
        border: '1px solid #ccc',
        background: 'white',
        fontSize: 12,
      }
    })

    // If not last prompt, add arrow edge
    if (i < history.length - 1) {
      edges.push({
        id: `e-${i}-${i + 1}`,
        source: `prompt-${i}`,
        target: `prompt-${i + 1}`,
        animated: true,
        style: { stroke: '#333' }
      })
    }

    // Add suggestion nodes
    const suggestions = prompt.analysis?.suggestions || []
    suggestions.forEach((s, j) => {
      const sid = `suggest-${i}-${j}`
      nodes.push({
        id: sid,
        position: { x, y: 100 + j * 60 },
        data: { label: s },
        style: {
          padding: 6,
          borderRadius: 6,
          border: '1px solid #ddd',
          background: '#f7f7f7',
          fontSize: 10,
          width: 160,
        }
      })

      edges.push({
        id: `edge-s-${i}-${j}`,
        source: `prompt-${i}`,
        target: sid,
        animated: false,
        style: { stroke: '#aaa' }
      })
    })
  })

  return (
    <div className="w-full h-[260px] border rounded-lg mt-3 bg-white shadow-inner">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background variant="dots" gap={12} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
