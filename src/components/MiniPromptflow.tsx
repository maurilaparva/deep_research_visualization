'use client'

import React from 'react'
import ReactFlow, {
  Background,
  Controls,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { PromptVersion } from '../lib/types'

interface MiniPromptFlowProps {
  history: PromptVersion[]
  activeIndex: number
}

export default function MiniPromptFlow({ history, activeIndex }: MiniPromptFlowProps) {
  if (!history.length) return null

  const nodes: any[] = []
  const edges: any[] = []

  history.forEach((prompt, i) => {
    const isActive = i === activeIndex
    const x = i * 200
    const y = 0

    // MAIN PROMPT NODE
    nodes.push({
      id: `prompt-${i}`,
      position: { x, y },
      data: { label: `v${i + 1}` },
      style: {
        padding: 10,
        borderRadius: 8,
        background: isActive ? '#f5f5f5' : 'white',
        border: isActive ? '2px solid black' : '1px solid #ccc',
        fontSize: 12,
        fontWeight: isActive ? 600 : 500,
        boxShadow: isActive ? '0 0 0 3px rgba(0,0,0,0.10)' : 'none',
        transition: 'all 0.25s ease',
        minWidth: 60,
        textAlign: 'center',
      }
    })

    // EDGE TO NEXT PROMPT
    if (i < history.length - 1) {
      edges.push({
        id: `e-${i}-${i + 1}`,
        source: `prompt-${i}`,
        target: `prompt-${i + 1}`,
        animated: true,
        style: { stroke: '#444', strokeWidth: 1.2 }
      })
    }

    // SUGGESTION NODES
    const suggestions = prompt.analysis?.suggestions || []
    suggestions.forEach((s, j) => {
      const sid = `suggest-${i}-${j}`
      nodes.push({
        id: sid,
        position: { x, y: 90 + j * 55 },
        data: { label: s },
        style: {
          padding: '6px 8px',
          borderRadius: 6,
          border: '1px solid #ddd',
          background: '#fafafa',
          fontSize: 10,
          width: 170,
          lineHeight: 1.2,
          opacity: isActive ? 1 : 0.55,
          transition: 'opacity 0.25s ease',
        }
      })

      edges.push({
        id: `edge-s-${i}-${j}`,
        source: `prompt-${i}`,
        target: sid,
        animated: false,
        style: { stroke: '#bbb' }
      })
    })
  })

  return (
    <div className="w-full h-[260px] border rounded-lg mt-3 bg-white shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{
          padding: 0.3,
        }}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnScroll
      >
        <Background variant="dots" gap={12} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}
