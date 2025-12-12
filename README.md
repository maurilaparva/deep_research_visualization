# Deep Research Prompt Refinement Visualization

This repository contains an interactive visualization system for **pre-run prompt refinement in Deep Research workflows**. The tool helps users diagnose prompt structure, scope, and constraints before executing long-running LLM-based research queries.

Rather than generating research content, the system provides diagnostic feedback on prompt quality and structure. It visualizes predicted quality signals (e.g., depth, breadth, coherence, relevance), detected constraints, and prompt version history to support iterative, interpretable refinement.

---

## Project Structure

Frontend: React, TypeScript, Vite  
Backend: Flask (Python)  
Model: LLaMA-3.3-70B-Instruct (served via Fireworks API)

---

## Setup Overview

To run the system locally, users must configure an API key, start the Flask backend, and launch the Vite frontend. Detailed setup instructions are provided via environment templates and standard project scripts included in the repository.

---

## Usage

Users begin by entering a research prompt in the left-hand workspace and triggering analysis. Each analyzed prompt becomes a new version that can be explored using a timeline and compact prompt graph. For each version, the interface displays quality metrics, detected constraints, and concrete suggestions for refinement.

The intended workflow is iterative: users refine prompts based on visual feedback and execute only the finalized prompt in a Deep Research system.

---

## Notes

The system operates strictly at the prompt level and does not generate, rewrite, or verify research content. All quality metrics are intended as diagnostic signals rather than objective measures of output quality.

All prompts, survey instruments, and evaluation procedures referenced in the accompanying paper are included in this repository.

---

## Citation

If you reference this system in academic work, please cite:

Interactive Visualization for Deep Research Prompt Refinement  
Villavicencio et al., CSCI 5541 NLP, 2025
