# First Agent Team

This repository demonstrates a small Codex team with one primary orchestrator and three executable custom agents:

- `content_agent` prepares supplied copy and identifies gaps.
- `development_agent` implements an assignment and uses read-only Figma tools when required and available.
- `review_agent` verifies acceptance criteria and uses Playwright MCP when required and available.

The team is assignment-independent. `docs/brief.md` is an input for a future test run, not configuration embedded in the agents.

## How the team is configured

- [.codex/config.toml](.codex/config.toml) registers the custom agents, caps open subagent threads at three, and configures the local Playwright MCP server.
- [.codex/agents/](.codex/agents/) contains executable TOML agent definitions with instructions and narrowed capabilities.
- [AGENTS.md](AGENTS.md) configures the primary Codex thread as orchestrator.
- [docs/team-spec.md](docs/team-spec.md) defines inputs, outputs, completion conditions, limits, and handoffs.

Codex must trust the repository before it loads project `.codex/` configuration. Start a new Codex session in this repository after configuration changes so agent and MCP discovery runs again.

## Invocation model

The primary Codex thread performs orchestration. For a future assignment it will:

1. Spawn `content_agent` and validate its JSON.
2. Spawn `development_agent` with validated content and the explicit output boundary.
3. Start a controlled local preview.
4. Spawn `review_agent` with the preview URL and acceptance criteria.
5. Route findings through at most two development/review correction rounds.
6. Assemble an evidence-backed handoff for human review.

These are dependent stages and run sequentially. Role files do not independently schedule themselves.

## Tool access

Custom agents inherit the parent session's sandbox, approvals, model provider, and MCP servers. Their TOML files can disable broad capabilities, but they cannot create separate sandboxes or per-agent MCP allowlists.

- Content has shell, apps, plugins, memories, and permission requests disabled.
- Development has workspace shell plus inherited apps/plugins. Project policy limits Figma to read-only use.
- Review has inherited apps/plugins but no shell. Project policy forbids implementation edits.
- Playwright MCP is project-configured through the pinned local package.
- Figma must already be authenticated in the parent Codex session; credentials are never stored here.

## Existing Node scaffold

The earlier Node.js connection-check scaffold remains in the repository but is inactive. It is not the current orchestrator and should not be extended or run unless Alfredo explicitly reactivates that approach.

## Current verification status

- Codex CLI `0.162.1` reports stable multi-agent, shell, apps, and plugins support enabled.
- Codex loaded the project configuration and reported nine effective MCP servers.
- `codex mcp list` shows project Playwright MCP enabled and the inherited Figma MCP configured.
- The three custom-agent TOML files exist with the required `name`, `description`, and `developer_instructions` fields.
- A fresh session has not yet spawned the configured agents, so role discovery, inherited Figma access, and Playwright tool availability remain unverified end to end.

No assignment or design was inspected during this configuration stage.

## Official documentation

- [Codex subagents and custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents)
- [Codex configuration basics](https://learn.chatgpt.com/docs/config-file/config-basic)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
