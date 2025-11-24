from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ------------------------------
# Flask app + CORS
# ------------------------------
app = Flask(__name__)
CORS(app)

# ------------------------------
# Load API Key
# ------------------------------
FIREWORKS_API = os.environ.get("FIREWORKS_API")
if not FIREWORKS_API:
    raise ValueError("🔥 FIREWORKS_API environment variable is missing!")

# ------------------------------
# Fireworks client
# ------------------------------
client = OpenAI(
    base_url="https://api.fireworks.ai/inference/v1",
    api_key=FIREWORKS_API,
)

# ------------------------------
# SETTINGS
# ------------------------------
MAX_TOKENS_ANALYZE = 256
MAX_TOKENS_REWRITE = 800
MAX_TOKENS_REFINE = 600
TEMPERATURE = 0.0  # deterministic
MODEL_ID = "accounts/fireworks/models/llama-v3p1-8b-instruct"

# ======================================================
# JSON EXTRACTION (UPGRADED)
# ======================================================

def _parse_last_json(s: str):
    """
    Extract the last valid JSON object from a string.
    Handles trailing chatter, nested braces, and multiple JSON blocks.
    """
    candidates = []
    stack = []
    start = None

    for i, ch in enumerate(s):
        if ch == '{':
            if not stack:
                start = i
            stack.append('{')
        elif ch == '}':
            if stack:
                stack.pop()
                if not stack and start is not None:
                    block = s[start:i+1]
                    try:
                        candidates.append(json.loads(block))
                    except:
                        pass

    return candidates[-1] if candidates else None

# ======================================================
# BASE CHAT FUNCTION
# ======================================================

def _chat(model_id, messages, max_tokens, temperature=TEMPERATURE):
    resp = client.chat.completions.create(
        model=model_id,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    text = resp.choices[0].message.content or ""
    usage = {
        "prompt_tokens": resp.usage.prompt_tokens or 0,
        "completion_tokens": resp.usage.completion_tokens or 0,
        "total_tokens": resp.usage.total_tokens or 0,
    }
    return text, usage

# ======================================================
# ANALYZE
# ======================================================

_ANALYZE_SYS = (
    "You are a prompt refinement expert for Deep Research. "
    "Your ONLY job is to analyze the user's prompt QUALITY, NOT to answer the question.\n\n"

    "Return STRICT JSON ONLY with keys:\n"
    "{\n"
    "  'intent': one_of['exploratory','analytical','comparative','brainstorm'],\n"
    "  'constraints_present': [...],\n"
    "  'constraints_missing': [...],\n"
    "  'scores': {'depth':0-100,'breadth':0-100,'coherence':0-100,'relevance':0-100},\n"
    "  'suggestions': [ list_of_prompt_edits_only ]\n"
    "}\n\n"

    "RULES:\n"
    " - NEVER answer the user’s research question.\n"
    " - NEVER give research or search advice.\n"
    " - NEVER suggest looking things up (Google Scholar, datasets, experts, etc.).\n"
    " - Suggestions MUST be edits to the prompt ITSELF.\n"
    " - Examples of valid suggestions:\n"
    "       'Specify a time range'\n"
    "       'Define the comparison target explicitly'\n"
    "       'State evidence requirements'\n"
    "       'Narrow the domain or population'\n"
    " - Suggestions MUST NOT be generic, repetitive, or unrelated to prompt quality.\n"
)

def analyze_prompt_internal(prompt: str):
    msgs = [
        {"role": "system", "content": _ANALYZE_SYS},
        {"role": "user", "content": f"PROMPT:\n{prompt}"},
    ]
    text, usage = _chat(MODEL_ID, msgs, MAX_TOKENS_ANALYZE, temperature=0.0)
    data = _parse_last_json(text)
    return data or {"error": "Failed to parse model output"}, usage

# ======================================================
# REWRITE
# ======================================================

def rewrite_prompt_internal(prompt: str):
    # Depth rewrite
    depth_msgs = [
        {"role": "system", "content": "Rewrite the prompt for DEPTH and EVIDENCE. Return ONLY the rewritten prompt."},
        {"role": "user", "content": prompt},
    ]
    depth, usage_d = _chat(MODEL_ID, depth_msgs, MAX_TOKENS_REWRITE, temperature=0.0)

    # Breadth rewrite
    breadth_msgs = [
        {"role": "system", "content": "Rewrite for BREADTH and COVERAGE. Return ONLY the rewritten prompt."},
        {"role": "user", "content": prompt},
    ]
    breadth, usage_b = _chat(MODEL_ID, breadth_msgs, MAX_TOKENS_REWRITE, temperature=0.0)

    usage = {
        "prompt_tokens": usage_d["prompt_tokens"] + usage_b["prompt_tokens"],
        "completion_tokens": usage_d["completion_tokens"] + usage_b["completion_tokens"],
        "total_tokens": usage_d["total_tokens"] + usage_b["total_tokens"],
    }

    return {
        "depth_oriented": depth.strip(),
        "breadth_oriented": breadth.strip(),
    }, usage

# ======================================================
# REFINE
# ======================================================

def refine_prompt_internal(prompt: str):
    msgs = [
        {"role": "system",
         "content": (
             "Refine the prompt for Deep Research. Add evidence requirements, comparison targets, "
             "and an output format. Return ONLY the improved final prompt."
         )},
        {"role": "user", "content": prompt},
    ]
    text, usage = _chat(MODEL_ID, msgs, MAX_TOKENS_REFINE, temperature=0.0)
    return text.strip(), usage

# ======================================================
# API ROUTES
# ======================================================

@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    try:
        prompt = request.json.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        result, usage = analyze_prompt_internal(prompt)
        return jsonify({"result": result, "usage": usage})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/rewrite", methods=["POST"])
def api_rewrite():
    try:
        prompt = request.json.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        result, usage = rewrite_prompt_internal(prompt)
        return jsonify({"result": result, "usage": usage})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/refine", methods=["POST"])
def api_refine():
    try:
        prompt = request.json.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        result, usage = refine_prompt_internal(prompt)
        return jsonify({"final_prompt": result, "usage": usage})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ======================================================
# RUN SERVER
# ======================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5180, debug=True)
