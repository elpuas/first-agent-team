# Experiment log

## 2026-10-26 — Stage 1: prerequisites and connection scaffold

### Scope

Implemented only the initial Node.js scaffold and connection checker. No landing page, agent prompts, orchestration loop, local preview, or review workflow was created.

### Document review

Confirmed decisions:

- The coordinator must run distinct content, development, and review model executions.
- The landing-page deliverable remains plain HTML and CSS, but it is outside this stage.
- Figma access is read-only for this exercise.
- Playwright browser access must be limited to the local preview and assignment resources.

Missing prerequisites and unresolved details:

- `docs/brief.md` says the Figma reference is pending. There is no URL, file key, target page, or node ID in the repository.
- Because the reference is missing, its file type (Design or Make), design context, screenshots, variables, and assets could not be tested.
- `docs/team-spec.md` requires structured handoff schemas but does not choose a schema library or exact JSON shapes. This is not a contradiction and is deferred to the next stage.
- The specification sets execution limits but does not select the default model. The scaffold makes the model explicit through `OPENAI_MODEL`.
- The review criteria require 200% zoom and contrast checks, but the future review evidence format does not yet define how manual or computed results are recorded.

No direct contradictions were found between `AGENTS.md`, `docs/team-spec.md`, and `docs/brief.md`. The main gap is that the brief calls the design “supplied” while its Design reference section still marks it pending.

### Figma inspection

Coding-session check executed:

- Called the connected Figma MCP `whoami` tool successfully.
- Confirmed that this Codex session is authenticated and has Figma plans available.
- Did not call file tools because there is no file key or target node to inspect.
- Did not create or modify Figma content.

Observed limitations:

- Official Figma documentation lists `get_design_context` for Design and Make files.
- `get_metadata` and variable-definition tools are Design-only; screenshots and asset downloads do not list Make support.
- A Make reference may therefore return code-oriented context without enough canvas metadata or exportable assets for faithful implementation. Only the actual reference can resolve this.
- Figma documents the hosted server as `https://mcp.figma.com/mcp` over HTTP with OAuth. It also says new custom clients need catalog approval/waitlist access. The Node checker is a custom client, separate from Codex's connected Figma plugin.

### SDK and MCP decision

- Model SDK: official `openai` JavaScript package, pinned to `7.43.0`.
- MCP client: official `@modelcontextprotocol/sdk`, pinned to `1.32.2`.
- Browser server: official `@playwright/mcp`, pinned to `0.0.83`.
- Model default in `.env.example`: `gpt-6-luna`, selected from the current official catalog for cost-sensitive workloads. It remains configuration, not business logic.
- Figma transport: Streamable HTTP.
- Playwright transport: stdio, because it is a local child process and does not need to be exposed on a port.

Reasons:

- These packages implement only the required model and MCP boundaries.
- Direct MCP connections let the coordinator control tool discovery and permissions instead of pretending coding-session tools are inherited.
- Pinning versions makes the tutorial repeatable.

### Checks executed before implementation

- Node.js: `v22.19.0`.
- npm: `10.9.3`.
- `npx`: present.
- npm registry versions queried on 2026-10-26: `openai@7.43.0`, `@modelcontextprotocol/sdk@1.32.2`, `@playwright/mcp@0.0.83`.
- `OPENAI_API_KEY`: present in the shell; value was not printed.
- `FIGMA_MCP_ACCESS_TOKEN`: missing.
- Connected Figma tool `whoami`: passed for the Codex coding session only.

### Known blockers before running the new command

- The Node Figma check cannot authenticate until a supported OAuth path and bearer token are provided.
- The supplied Figma reference URL/node is missing, so connection success alone would not validate design access.

### Official documentation reviewed

- OpenAI Responses API MCP servers: remote servers use Streamable HTTP or HTTP/SSE and may require an OAuth access token; tool allowlists and approvals are supported.
- Figma remote server: hosted endpoint, OAuth sign-in, supported-client restriction, and link/node-based design context.
- Figma tool matrix: Make supports `get_design_context`, but several supporting inspection and asset tools do not list Make.
- Playwright MCP: Node.js 18+, official npm server, stdio configuration, optional HTTP mode, and security warning that the server is not a security boundary.
- MCP TypeScript SDK: high-level clients support stdio and Streamable HTTP transports plus `listTools` and `callTool`.

### Implementation and execution evidence

- `npm install`: passed; 99 packages installed, 0 audit vulnerabilities reported.
- First `npm run check:connections`: failed as expected, and revealed two implementation issues: the Playwright CLI path was blocked by package exports and the raw OpenAI SDK error retained part of the rejected credential. The CLI path was changed to resolve the exported package manifest and join its directory; error reporting now replaces authentication failures with a credential-free message.
- Second run: OpenAI failed with HTTP 401, Figma was blocked by the missing token, and Playwright reached the server but its tool call failed because the checker passed an unsupported explicit browser value.
- Final `npm run check:connections`: exited 1 because not all required checks passed.
  - OpenAI model: failed — the API rejected the `OPENAI_API_KEY` available in the shell. The key value was not printed by the final command.
  - Figma MCP: blocked before network connection — `FIGMA_MCP_ACCESS_TOKEN` is missing.
  - Playwright MCP: passed — connected over stdio, listed 25 tools, and the read-only `browser_tabs` list call succeeded.

The checker correctly continues after an individual failure, reports each boundary independently, and returns non-zero unless all three pass.

## 2026-10-26 — Stage 2: native Codex team configuration

### Scope correction

The active goal is to configure the agent team, not execute the example assignment. The earlier Node.js checker remains intact but is no longer the active orchestration approach. No assignment brief or design was inspected in this stage.

### Supported configuration decision

Current official Codex documentation establishes that:

- Project-scoped executable custom agents are standalone TOML files under `.codex/agents/`.
- Project `.codex/config.toml` defines multi-agent limits, role registrations, and project MCP servers.
- `AGENTS.md` provides repository guidance but does not create executable agents by itself.
- Custom agents inherit parent sandbox, approvals, provider, and MCP servers. Agent files can narrow supported feature capabilities but cannot override those inherited controls or establish per-role MCP allowlists.

The primary Codex thread is therefore the orchestrator. Three custom agents are registered: `content_agent`, `development_agent`, and `review_agent`.

### Configuration added

- `.codex/config.toml`: enables agents, caps three open subagent threads, registers all roles, and adds pinned Playwright MCP over stdio with localhost-only allowed origins.
- `.codex/agents/content-agent.toml`: no-tool content organization role.
- `.codex/agents/development-agent.toml`: implementation role with shell and inherited Figma-capable app/plugin access.
- `.codex/agents/review-agent.toml`: no-shell review role with inherited Playwright/Figma-capable app/plugin access.
- `AGENTS.md` and `docs/team-spec.md`: primary orchestration, handoff, output, completion, evidence, and two-correction-round rules.

### Checks actually executed

- `codex --version`: `codex-cli 0.162.1`.
- `codex features list`: stable `multi_agent`, `shell_tool`, `apps`, and `plugins` are enabled.
- `codex mcp list` before configuration: Figma was enabled globally; Playwright was absent.
- `codex doctor --json` after configuration: project configuration loaded successfully and the effective MCP count was nine. Overall doctor status was `fail` because network reachability is restricted in this execution environment, not because the project config failed to parse.
- `codex mcp list` after configuration: project Playwright MCP and inherited Figma MCP both appear enabled.
- `git diff --check`: passed.

### Limitations and unverified behavior

- This active Codex session began before the new project agent files existed. A new trusted session is required for discovery.
- No configured role was spawned, so role selection and JSON handoffs remain unverified.
- Playwright is configured but was not started or called in this stage.
- Figma appears in the parent MCP configuration, but inherited access from a newly spawned development/review agent remains unverified.
- Tool separation is capability-level plus instructional. Codex custom-agent files do not currently provide a per-role MCP server allowlist or separate sandbox.
- The output JSON shapes are instruction contracts; no machine schema validator is implemented in this native configuration stage.

## 2026-10-26 — Native team smoke test

### Scope

Ran only the three configured role smoke tests. The Café Roble brief was not executed, no design was opened, no landing page was built, no implementation file was edited, and no external website was visited.

### Content agent

Invocation: passed. `content_agent` ran as a separate delegated execution with a tiny fictional Lantern Library brief.

Behavior result: passed.

- Preserved the supplied name, introduction, and hours.
- Returned `status: "blocked"` because the required street address was absent.
- Reported `"Street address required for the visit information section."` in `missing_information`.
- Did not invent an address or another fact.

Contract validation: passed. The response was valid JSON and contained every documented top-level field with the expected type: `status`, `sections`, `missing_information`, `conflicts`, and `assumptions_requiring_confirmation`. No malformed or missing field was found.

### Development agent and Figma

Invocation: passed. `development_agent` ran as a separate delegated execution and changed no files.

Contract validation: passed. The response was valid JSON and contained `status`, `files_changed`, `checks_performed`, `implementation_notes`, and `unresolved_requirements`. Each check contained `check`, `result`, and `evidence`. No malformed or missing field was found.

Figma connection: passed.

- The delegated-agent transcript records an actual `figma.whoami` MCP call.
- The recorded tool event marked the operation read-only and returned success.
- The agent did not call a file, node, session, metadata, screenshot, or mutation tool.
- Configured capability and successful tool execution were recorded separately; the pass is based on the tool event, not only the agent's final claim.

### Review agent and Playwright

Invocation: passed. `review_agent` ran as a separate delegated execution and returned the required JSON shape.

Contract validation: passed. The response contained `status`, `criteria`, `findings`, `evidence_paths`, and `recommendation`. The criterion contained `id`, `result`, and an evidence array; the finding contained all required fields. No malformed or missing field was found.

Playwright connection: pending / not verified.

- No Playwright MCP namespace or `browser_tabs` equivalent was exposed to the delegated review-agent execution.
- The agent correctly returned `status: "blocked"`, criterion result `not_verified`, and recommendation `blocked`.
- No Playwright tool call occurred, so configuration is not counted as a successful connection.
- The agent did not substitute shell, Playwright CLI, Chrome DevTools, Node REPL, or another browser tool and did not navigate anywhere.

### Smoke-test matrix

| Item | Result | Evidence |
| --- | --- | --- |
| `content_agent` invocation and handoff | Pass | Separate agent completed; JSON contract valid; missing address identified without invention |
| `development_agent` invocation and handoff | Pass | Separate agent completed; JSON contract valid; no files changed |
| Figma read-only connection | Pass | Delegated transcript contains successful read-only `figma.whoami` tool event |
| `review_agent` invocation and handoff | Pass | Separate agent completed; JSON contract valid; truthful blocked result |
| Playwright MCP connection | Pending | No callable Playwright MCP tool was exposed; no tool call occurred |

### Remaining limitation

The project Playwright MCP entry is present in `.codex/config.toml`, but this delegated review execution did not receive its tool namespace. A later, narrowly scoped check must begin in a fresh trusted Codex session where the project MCP server successfully initializes. This smoke test stops here as requested.

## 2026-10-26 — Playwright MCP exposure investigation

### Scope

Investigated only why the native `review_agent` did not receive Playwright MCP during the prior smoke test. No assignment brief or design was inspected, no external website was visited, and no implementation file was edited.

### Configuration and restriction findings

- `.codex/config.toml` contains an enabled project-level `playwright` stdio server using the pinned `@playwright/mcp@0.0.83` package, headless isolated mode, and localhost-only allowed origins.
- `codex mcp get playwright` parsed that entry and reported it enabled with the expected command, arguments, and timeouts. This verifies configuration discovery only.
- `.codex/agents/review-agent.toml` disables shell access and prohibits implementation edits, but it leaves apps and plugins enabled. It does not contain an MCP override.
- Current official Codex documentation says custom agents inherit the parent session's MCP servers and cannot override `mcp_servers` in their custom-agent file. Therefore `shell_tool = false` and the no-edit policy do not explain the missing Playwright namespace.

### Layered verification

| Layer | Result | Evidence |
| --- | --- | --- |
| Project configuration discovery | Pass | `codex mcp get playwright` reported the server enabled with the configured stdio command and arguments |
| Playwright MCP server startup | Pass | The official MCP client connected to the exact configured `npx --no-install @playwright/mcp@0.0.83 ...` command |
| Server tool discovery | Pass | `listTools` returned 25 tools and included `browser_tabs` |
| Restricted-shell tool execution | Fail | `browser_tabs {"action":"list"}` reached Chrome launch, then Chrome exited with `SIGABRT`; cleanup also reported `kill EPERM` |
| Permitted browser-launch tool execution | Pass | The same read-only call returned one `about:blank` tab; it did not navigate to a website |
| Current primary-session Playwright exposure | Fail | The primary session's model-visible inventory contains zero tools whose names include `playwright` |
| Prior `review_agent` Playwright exposure | Fail | Its smoke-test execution had no Playwright namespace or `browser_tabs` tool and made no Playwright call |

The direct MCP diagnostic verifies the configured server independently; it does not prove that this already-running Codex thread loaded the server.

### Cause and supported resolution

The server configuration and server process are valid. The missing tool was caused by session-level exposure: this primary thread was already running without a Playwright tool namespace, so the delegated `review_agent` inherited no Playwright MCP tools. The review agent's restrictions did not filter out the server.

No project configuration change was required. Official Codex App Server documentation provides `config/mcpServer/reload` to reload configuration and queue a refresh for loaded threads, plus `mcpServerStatus/list` to inspect startup and tool state. Those controls are not exposed to this coding-session tool surface. A fresh trusted Codex session opened in this project is therefore required for the next native-agent verification.

### Next test prompt

> Read `AGENTS.md` and `docs/team-spec.md`. Run only the `review_agent` Playwright MCP connection check. Ask it to call `browser_tabs` with `{"action":"list"}` without navigating anywhere or editing files. Validate its JSON handoff and report separately: agent invocation, Playwright tool discovery, and Playwright tool execution. Stop after this check.
