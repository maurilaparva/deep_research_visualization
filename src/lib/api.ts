export async function analyzePrompt(prompt: string) {
  const res = await fetch("http://localhost:5180/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze prompt");
  }

  return res.json(); // returns { result, usage }
}

export async function rewritePrompt(prompt: string) {
  const res = await fetch("http://localhost:5180/api/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("Failed to rewrite prompt");
  }

  return res.json(); // returns { result, usage }
}

export async function refinePrompt(prompt: string) {
  const res = await fetch("http://localhost:5180/api/refine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error("Failed to refine prompt");
  }

  return res.json(); // returns { final_prompt, usage }
}
