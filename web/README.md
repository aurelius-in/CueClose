# CueClose web

Branded Next.js workspace for the CueClose synthetic touring-finance demo.

```bash
npm install
npm run dev -- --port 3847
```

Production:

```bash
npm run build
npm run start -- --port 3847
```

The App Router embeds `/api/v1/*` demo routes with the same contracts as the Python FastAPI reference service under `../api`.
