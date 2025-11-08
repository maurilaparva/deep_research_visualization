import React from 'react'
import { PromptAnalysis } from '../../lib/types'

interface ConstraintBadgesProps {
  constraints: PromptAnalysis['constraints']
}

export function ConstraintBadges({ constraints }: ConstraintBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(constraints).map(([key, value]) => (
        <div
          key={key}
          className={`
            px-2 py-1 rounded-full text-sm font-medium
            ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          `}
        >
          <div className="flex items-center space-x-1">
            <span>{value ? '✓' : '✗'}</span>
            <span className="capitalize">{key}</span>
          </div>
        </div>
      ))}
    </div>
  )
}