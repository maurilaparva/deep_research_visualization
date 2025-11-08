# Deep Research Prompt Refinement Visualization

## Project Overview
This project builds an interactive visualization tool for refining prompts used with ChatGPT's Deep Research feature. The tool helps researchers balance breadth vs depth in their research queries by providing pre-run visualization and analysis of prompts.

## Architecture

### Core Components
- `src/components/prompt/` - Prompt analysis and refinement components
  - `prompt-analyzer.tsx` - Analyzes prompt characteristics
  - `prompt-visualizer.tsx` - Visualizes prompt-response relationships
  - `constraint-badges.tsx` - Shows missing constraints
- `src/components/vis/` - Visualization components (adapted from KnowNet)
  - `flow.tsx` - Base visualization engine
  - `sankey.tsx` - Prompt-response flow visualization
- `src/lib/` - Shared utilities and types
- `src/models/` - Lightweight LLM integration

### Data Flow
1. User inputs research prompt
2. Pre-run analysis:
   - Intent classification (exploratory/analytical/comparative)
   - Constraint detection (evidence, scope, comparisons)
   - Depth-breadth prediction
3. Visualization shows:
   - Prompt modification impacts
   - Quality metrics (coherence, depth, relevance)
   - Suggested refinements

## Key Patterns

### Prompt Analysis
- Intent categories: exploratory, analytical, comparative
- Quality dimensions: depth, coherence, relevance
- Constraint types: evidence, scope, comparisons
- Format: Uses lightweight LLM for quick analysis

### Visualization Patterns  
- Sankey diagrams for prompt-response flow
- Color coding for quality metrics
- Interactive badges for constraints
- Tooltips for refinement suggestions

### State Management
- Uses Jotai atoms for global state
- Key atoms: `promptHistoryAtom`, `qualityMetricsAtom`, `constraintsAtom`

## Development Workflow

### Setup
```bash
python3 -m venv venv
source venv/bin/activate
pnpm install
cp .env.example .env  # Set API keys
```

### Running
```bash
pnpm run dev  # Start frontend
./run_flask.sh  # Start backend (separate terminal)
```

### Testing
- User study framework in `src/study/`
- Quality metrics computed in `src/lib/metrics.ts`
- Prompt logs saved to CSV/JSON

## Best Practices
- Use lightweight models for pre-run analysis
- Keep UI simple and accessible for non-technical users
- Log all prompt-response pairs for analysis
- Include clear tooltips and guidance
- Support CSV/screenshot export of results

## Integration Points
- Deep Research API wrapper in `src/lib/deep-research.ts`
- HuggingFace integration for local models
- D3.js for custom visualizations
- Flask/FastAPI backend for model serving