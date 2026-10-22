# Graph Report - KassiesRecipies  (2026-10-22)

## Corpus Check
- Corpus is ~11,128 words - fits in a single context window. You may not need a graph.

## Summary
- 360 nodes · 785 edges · 19 communities (12 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.86)
- Token cost: 309,659 input · 0 output

## Community Hubs (Navigation)
- Recipe View & UI Primitives
- App Shell & Redux State
- Recipe Forms & Conversion
- Lint & npm Scripts
- API Route Handlers
- Docs, Deploy & Design Rules
- Runtime Dependencies
- Units & Modal Enums
- TypeScript Config
- shadcn Config
- Dev Dependencies
- Data Interfaces & Models
- PostCSS Config
- Docker Build Script
- Globe Icon Asset
- Next.js Logo Asset
- Vercel Logo Asset
- Window Icon Asset
- File Icon Asset

## God Nodes (most connected - your core abstractions)
1. `cn()` - 38 edges
2. `react` - 18 edges
3. `AddRecipieForm()` - 17 edges
4. `Units` - 17 edges
5. `AddRecipieForm()` - 16 edges
6. `compilerOptions` - 16 edges
7. `Recipies()` - 14 edges
8. `ShowRecipie()` - 14 edges
9. `Button` - 13 edges
10. `conversion` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Raspberry Pi ARM64 Tarball Deployment` --semantically_similar_to--> `Build and Deploy Docker Image Workflow`  [INFERRED] [semantically similar]
  README.md → .github/workflows/deploy.yml
- `deploy.sh (/home/kai/Sites)` --references--> `kassiesrecipies docker-compose service`  [AMBIGUOUS]
  .github/workflows/deploy.yml → docker-compose.yml
- `AddProps` --references--> `conversion`  [EXTRACTED]
  components/AddRecipieForm.tsx → interfaces/converstion.ts
- `Recipies()` --indirect_call--> `getAddConversionIsOpen()`  [INFERRED]
  components/Recipies.tsx → redux/features/recipieListSlice.ts
- `Recipies()` --indirect_call--> `getAddRecipieIsOpen()`  [INFERRED]
  components/Recipies.tsx → redux/features/recipieListSlice.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Deployment pipeline: CI workflow, deploy script, compose service, healthcheck** — _github_workflows_deploy_build_and_deploy_workflow, _github_workflows_deploy_deploy_sh, docker_compose_kassiesrecipies_service, docker_compose_healthcheck, claude_health_endpoint [INFERRED 0.75]
- **Divergent MongoDB connection configuration sources** — docker_compose_mongo_uri, readme_mongodb_uri, claude_mongodb_connection [INFERRED 0.75]

## Communities (19 total, 7 thin omitted)

### Community 0 - "Recipe View & UI Primitives"
Cohesion: 0.08
Nodes (41): Modal(), multipliers, ShowRecipie(), ButtonProps, buttonVariants, DialogContent, DialogDescription, DialogFooter() (+33 more)

### Community 1 - "App Shell & Redux State"
Cohesion: 0.09
Nodes (27): Home(), Layout(), LayoutProps, Navbar(), containerVariants, itemVariants, Recipies(), conversions (+19 more)

### Community 2 - "Recipe Forms & Conversion"
Cohesion: 0.15
Nodes (29): AddConversion(), AddRecipieForm(), errMsgs, rowVariants, toGrams(), AddRecipieForm(), errMsgs, rowVariants (+21 more)

### Community 3 - "Lint & npm Scripts"
Cohesion: 0.05
Nodes (33): compat, __dirname, eslintConfig, __filename, name, private, scripts, build (+25 more)

### Community 4 - "API Route Handlers"
Cohesion: 0.09
Nodes (19): addConversion(), GET(), getConversions(), POST(), addRecipie(), config, deleteRecipie(), GET() (+11 more)

### Community 5 - "Docs, Deploy & Design Rules"
Cohesion: 0.12
Nodes (18): Build and Deploy Docker Image Workflow, deploy.sh (/home/kai/Sites), Self-hosted GitHub Actions Runner, API Routes (/api/recipie, /api/conversion, /api/uploads, /api/health), GET /api/health, homeauto sibling dashboard, Kassies Recipes Project Overview, Mongoose Models (Recipie, Conversion) (+10 more)

### Community 6 - "Runtime Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, clsx, framer-motion, @hookform/resolvers, lucide-react, mongoose, next (+13 more)

### Community 7 - "Units & Modal Enums"
Cohesion: 0.12
Nodes (15): Units, cup, floz, g, mg, tbsp, tsp, whole (+7 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "shadcn Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, @eslint/eslintrc, jsdom, postcss, tailwindcss, @testing-library/jest-dom (+7 more)

### Community 11 - "Data Interfaces & Models"
Cohesion: 0.26
Nodes (8): AddProps, AddProps, RecipieProp, conversion, ingredient, recipie, recipieForm, recipieSchema

## Ambiguous Edges - Review These
- `deploy.sh (/home/kai/Sites)` → `kassiesrecipies docker-compose service`  [AMBIGUOUS]
  .github/workflows/deploy.yml · relation: references
- `MONGO_URI environment variable` → `MongoDB Connection (per-call, no pooling)`  [AMBIGUOUS]
  docker-compose.yml · relation: conceptually_related_to
- `MONGODB_URI environment variable` → `MongoDB Connection (per-call, no pooling)`  [AMBIGUOUS]
  README.md · relation: conceptually_related_to

## Knowledge Gaps
- **33 isolated node(s):** `g`, `mg`, `cup`, `tbsp`, `tsp` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 163 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `API Route Handlers` to `Recipe View & UI Primitives`, `App Shell & Redux State`, `Lint & npm Scripts`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **What connects `g`, `mg`, `cup` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Recipe View & UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.08145363408521303 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `Lint & npm Scripts`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Should `App Shell & Redux State` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `deploy.sh (/home/kai/Sites)` and `kassiesrecipies docker-compose service`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `MONGO_URI environment variable` and `MongoDB Connection (per-call, no pooling)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._