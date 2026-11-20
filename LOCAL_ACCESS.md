# Get this project onto your Windows machine

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

## What you get locally

| Path | What |
|---|---|
| `docs\` | Architecture docs and diagrams |
| `api\` | FastAPI reference service |
| `docs\client-ipr-*.md` | Simulated client transcript + notes |
| `web\` | Runnable demo (Baseline vs Pro edition editions) |

### Run the demo locally

```powershell
cd C:\local\CueClose\web
npm install
npm run build
npm run start -- --port 3847
```

Open http://127.0.0.1:3847 and use the header **Edition** toggle.
