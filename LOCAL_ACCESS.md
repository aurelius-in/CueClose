# Local development on Windows

This cloud VM cannot write to `C:\local\CueClose`. Use GitHub as the source of truth.

## One command (recommended)

In **PowerShell**:

```powershell
irm https://raw.githubusercontent.com/aurelius-in/CueClose/main/GET_LOCAL_COPY.ps1 | iex
```

Or download `GET_LOCAL_COPY.ps1` from the repo and run it. It clones/pulls into `C:\local\CueClose`.

## Manual zip download

1. Open https://github.com/aurelius-in/CueClose/archive/refs/heads/main.zip
2. Extract into `C:\local\CueClose` (replace/merge as needed)

## What you get

| Path | What |
|---|---|
| `web\` | Next.js product UI + embedded demo API (Classic and Pro editions) |
| `api\` | FastAPI reference service and domain tests |
| `docs\` | Architecture viewpoints, ADRs, diagrams, product walkthrough |
| `brand\` | Logo and color tokens |

### Run the demo locally

```powershell
cd C:\local\CueClose\web
npm install
npm run build
npm run start -- --port 3847
```

Open http://127.0.0.1:3847 and use the header **Edition** toggle to compare Classic and Pro.
