import { Button } from './ui/button'
import { IconArrowRight } from './ui/icons'

interface EmptyScreenProps {
  setInput: (input: string) => void
}

const examplePrompts = [
  {
    heading: 'Exploratory Research',
    message: 'What are the current approaches to balancing depth and breadth in literature reviews of interdisciplinary topics?'
  },
  {
    heading: 'Analytical Deep Dive', 
    message: 'Compare and analyze the effectiveness of different prompt engineering techniques for academic research tasks between 2023-2025.'
  },
  {
    heading: 'Comparative Analysis',
    message: 'How do traditional systematic review methods compare to AI-assisted literature review approaches in terms of comprehensiveness and efficiency?'
  }
]

export function EmptyScreen({ setInput }: EmptyScreenProps) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to Deep Research Visualization
        </h1>
        <p className="mb-4 leading-normal text-muted-foreground">
          This tool helps you refine research prompts by visualizing how changes in prompt structure affect depth, breadth, and quality of responses. Get started by exploring one of these examples or try your own research question.
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {examplePrompts.map((example, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(example.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {example.heading}
            </Button>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Our visualization helps you balance research depth vs breadth, detect missing constraints, and refine prompts for more comprehensive results.
        </p>
      </div>
    </div>
  )

  // inputs
  const [openaiKeyInput, setOpenaiKeyInput] = useState<string>('');
  const [googleKeyInput, setGoogleKeyInput] = useState<string>(''); // was "serper"
  const [googleCxInput, setGoogleCxInput] = useState<string>('');   // NEW: cx

  const [error, setError] = useState<string | null>(null);

  // keep the modal in sync if App.tsx toggles initialOpen
  useEffect(() => {
    setOpen(!!initialOpen);
  }, [initialOpen]);

  const saveKey = () => {
    // Trim + strip accidental surrounding quotes
    const k = openaiKeyInput.trim().replace(/^["']|["']$/g, '');
    const g = googleKeyInput.trim().replace(/^["']|["']$/g, '');
    const cx = googleCxInput.trim().replace(/^["']|["']$/g, '');

    // Validations (light)
    if (!k || k.length < 20 || !k.startsWith('sk-')) {
      setError('Please paste a valid OpenAI API key (e.g., starts with "sk-").');
      return;
    }
    if (!g || g.length < 20) {
      setError('Please paste a valid Google API key (from Google Cloud Console).');
      return;
    }
    if (!cx || cx.length < 8) {
      setError('Please paste your Search Engine ID (cx).');
      return;
    }

    setError(null);

    // Persist:
    // - OpenAI via parent setter (App.tsx already persists locally)
    // - Google API key via the existing `setSerperKey` (back-compat for Phase 1–2)
    // - cx directly to localStorage (safe + frontend-only)
    setApiKey(k);
    setSerperKey(g);
    try {
      localStorage.setItem('google-cx', cx);
      // Optional: mark that some keys are set so the app doesn’t nag on first load.
      localStorage.setItem('has-token-been-set', 'true');
    } catch {}

    // Reset inputs + close
    setOpen(false);
    setOpenaiKeyInput('');
    setGoogleKeyInput('');
    setGoogleCxInput('');
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">Welcome to Prototype!</h1>

        <p className="mb-2 leading-normal text-muted-foreground">
          I am a chatbot who can help you construct a comprehensive understanding about objects
          of interest by providing both text and visual interactions!
          <br />
          This demo specializes in dietary supplement and related health conditions.
        </p>

        <p className="leading-normal text-muted-foreground">You can try out the following examples:</p>

        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>

        <p className="leading-normal text-muted-foreground mt-4">
          You can also start a conversation about a specific supplement or its relation with the
          supported entity types.
        </p>

        {/* Action to open the API key modal manually */}
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Set API keys
          </Button>
          <span className="text-xs text-muted-foreground">
            Your keys (OpenAI + Google API key + Search Engine ID) are stored locally in your browser.
          </span>
        </div>
      </div>

      {/* Simple modal (no extra UI libs required) */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-xl">
            <h2 className="text-base font-semibold mb-2">Enter your API keys</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Paste your OpenAI key, your Google API key, and your Search Engine ID (cx).
              These are stored only in your browser and sent with requests from this page.
            </p>

            {/* OpenAI */}
            <label htmlFor="openai-key" className="text-sm font-medium">OpenAI API key</label>
            <input
              id="openai-key"
              type="password"
              placeholder="sk-********************************"
              value={openaiKeyInput}
              onChange={(e) => setOpenaiKeyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveKey(); }}
              className="w-full rounded-md border px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />

            {/* Google API key (reuses setSerperKey behind the scenes in Phase 1) */}
            <label htmlFor="google-key" className="text-sm font-medium">Google API key</label>
            <input
              id="google-key"
              type="password"
              placeholder="AIza***********************************"
              value={googleKeyInput}
              onChange={(e) => setGoogleKeyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveKey(); }}
              className="w-full rounded-md border px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-ring"
            />

            {/* cx */}
            <label htmlFor="google-cx" className="text-sm font-medium">Search Engine ID (cx)</label>
            <input
              id="google-cx"
              type="text"
              placeholder="e.g. 85bd440b6cefc4c80"
              value={googleCxInput}
              onChange={(e) => setGoogleCxInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveKey(); }}
              className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveKey}>Save</Button>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              Don’t have keys? Create an OpenAI API key in your OpenAI account, a Google API key in
              Google Cloud Console (with Custom Search API enabled + HTTP referrer restrictions),
              and a Search Engine ID in Programmable Search Engine.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
