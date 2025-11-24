import { PromptAnalysis } from './types'

export async function analyzePrompt(text: string): Promise<PromptAnalysis> {
  const res = await fetch("http://localhost:5180/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: text }),
  });

  if (!res.ok) {
    throw new Error("Backend analysis failed");
  }

  const { result } = await res.json();

  if (!result) {
    throw new Error("Invalid response format from backend");
  }

  return {
    intent: result.intent || "exploratory",

    constraints: {
      evidence: (result.constraints_present || []).includes("evidence"),
      scope: (result.constraints_present || []).includes("scope"),
      comparisons: (result.constraints_present || []).includes("comparisons")
    },

    metrics: {
      depth: (result.scores?.depth ?? 0) / 100,
      breadth: (result.scores?.breadth ?? 0) / 100,
      coherence: (result.scores?.coherence ?? 0) / 100,
      relevance: (result.scores?.relevance ?? 0) / 100,
    },

    suggestions: result.suggestions || []
  };
}
