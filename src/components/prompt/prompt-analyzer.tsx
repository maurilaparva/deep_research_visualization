import React from 'react'
import { Button } from '../ui/button'

interface PromptAnalyzerProps {
  isAnalyzing: boolean
  onPromptSubmit: (text: string) => Promise<void>
}

export function PromptAnalyzer({ isAnalyzing, onPromptSubmit }: PromptAnalyzerProps) {
  const [promptText, setPromptText] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptText.trim()) return
    onPromptSubmit(promptText)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">
        Research Prompt
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          className="w-full h-32 p-2 border rounded bg-background"
          placeholder="Enter your research prompt..."
          disabled={isAnalyzing}
        />
        <Button type="submit" disabled={isAnalyzing || !promptText.trim()}>
          {isAnalyzing ? 'Analyzing...' : 'Analyze Prompt'}
        </Button>
      </form>
    </div>
  )
}
