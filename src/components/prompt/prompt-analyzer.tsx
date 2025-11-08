import React from 'react'
import { PromptAnalysis } from '../../lib/types'
import { Button } from '../ui/button'

interface PromptAnalyzerProps {
  analysis: PromptAnalysis | null
  isAnalyzing: boolean
  onPromptSubmit: (text: string) => Promise<void>
}

export function PromptAnalyzer({ analysis, isAnalyzing, onPromptSubmit }: PromptAnalyzerProps) {
  const [promptText, setPromptText] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptText.trim()) return
    onPromptSubmit(promptText)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Research Prompt</h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full h-32 p-2 border rounded resize-none"
            placeholder="Enter your research prompt..."
            disabled={isAnalyzing}
          />
          <Button type="submit" disabled={isAnalyzing || !promptText.trim()}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Prompt'}
          </Button>
        </form>
      </div>

      {analysis && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Intent</h3>
            <p className="text-sm capitalize">{analysis.intent}</p>
          </div>

          <div>
            <h3 className="font-medium">Constraints</h3>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {Object.entries(analysis.constraints).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm capitalize">{key}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium">Quality Metrics</h3>
            <div className="space-y-2 mt-1">
              {Object.entries(analysis.metrics).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{key}</span>
                    <span>{Math.round(value * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium">Suggestions</h3>
            <ul className="list-disc list-inside space-y-1 mt-1">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}