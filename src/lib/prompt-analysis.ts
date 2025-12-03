import { PromptAnalysis } from './types'
import { API_BASE } from "./config";

export async function analyzePrompt(text: string): Promise<PromptAnalysis> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: text }),
  });

  // Read the raw body once
  const raw = await res.text();
  console.log("analyzePrompt status:", res.status, "raw body:", raw);

  if (!res.ok) {
    // This will now show you the real Flask error in the console
    throw new Error("Backend analysis failed");
  }

  const { result } = JSON.parse(raw);

  if (!result) {
    throw new Error("Invalid response format from backend");
  }

  return {
    intent: result.intent || "exploratory",

    constraints: {
      evidence: (result.constraints_present || []).includes("evidence"),
      scope: (result.constraints_present || []).includes("scope"),
      comparisons: (result.constraints_present || []).includes("comparisons"),
    },

    metrics: {
      depth: (result.scores?.depth ?? 0) / 100,
      breadth: (result.scores?.breadth ?? 0) / 100,
      coherence: (result.scores?.coherence ?? 0) / 100,
      relevance: (result.scores?.relevance ?? 0) / 100,
    },

    suggestions: result.suggestions || [],
  };
}
