# Codex agent team specification

## Objective

Configure a reusable Codex team that can receive a future landing-page assignment, prepare its content, implement it, and review it. The team configuration is independent of Café Roble or any other business-specific brief.

This is an explicitly orchestrated workflow. The primary Codex thread owns routing, state, limits, and the final handoff. Three project-scoped custom agents perform bounded stages.

## Supported implementation

Codex supports project-scoped custom agents as standalone TOML files in `.codex/agents/`. This project registers them in `.codex/config.toml`. `AGENTS.md` provides durable policy for the primary thread but is not itself an executable agent definition.

Configured roles:

| Role | Executable configuration | Invocation |
| --- | --- | --- |
| Orchestrator | Primary Codex thread governed by `AGENTS.md` and this specification | User starts an assignment in the project; the primary thread delegates named stages |
| Content | `.codex/agents/content-agent.toml` | Orchestrator spawns `content_agent` |
| Development | `.codex/agents/development-agent.toml` | Orchestrator spawns `development_agent` |
| Review | `.codex/agents/review-agent.toml` | Orchestrator spawns `review_agent` |

The existing Node.js files are retained but are not the active orchestrator implementation in this stage.

## Runtime inheritance and limitations

Custom agents inherit the primary session's permission mode, sandbox, model provider, and MCP servers. Agent TOML can disable supported capabilities such as shell, apps, plugins, memories, or permission requests; it cannot establish a separate sandbox or override the parent's MCP server configuration.

Consequences:

- Tool separation is partly enforceable: content has shell/apps/plugins disabled, and review has shell disabled.
- Per-server allowlists are not available in custom-agent files. Development and review inherit every parent MCP server that is enabled, so their instructions provide the narrower role policy.
- Figma access depends on the parent Codex session having an authenticated Figma plugin or MCP connection. This project does not store Figma credentials.
- Playwright MCP is configured project-wide through `.codex/config.toml` and becomes available only in a new trusted Codex session that successfully starts the server.
- Agent discovery and configuration loading occur at session start. The current session can write and validate the files but does not prove that a future session loaded the new roles.
- Instruction-required JSON is a contract, not a machine-enforced schema. The orchestrator must validate each handoff before continuing.

## Orchestrator

### Inputs

- Assignment brief and acceptance criteria.
- Explicit assignment output directory.
- Optional design reference when required by that assignment.
- Parent-session model, permissions, and connected tools.
- Execution limits.

### Responsibilities

- Validate run inputs without inventing missing data.
- Create and update run state after each stage.
- Spawn the named custom agents in order.
- Give each agent only the context required for its role.
- Validate JSON shape, statuses, paths, and claimed evidence.
- Ensure only development edits assignment implementation files.
- Start and stop the controlled local preview.
- Route review findings back to development.
- Enforce at most two correction rounds.
- Produce the truthful final status and handoff.

### Tools and permissions

- Uses the primary session's filesystem and delegation tools.
- May start a local preview within the active sandbox.
- Does not grant permissions that the parent session lacks.
- Does not pass secrets to agents or persist them in run artifacts.

### Completion conditions

- All required stages have valid handoffs, or an exact blocker is recorded.
- Every final claim is supported by state or evidence.
- No more than two correction rounds were attempted.
- Human review remains explicitly pending until Alfredo accepts the result.

## Content agent

### Inputs

- Assignment brief and acceptance criteria copied into the delegated task.
- Supplied facts and content rules.

### Responsibilities

- Organize copy by section.
- Preserve supplied facts and required wording.
- Identify missing, conflicting, or ambiguous information.
- Draft only where the brief explicitly permits drafting.

### Tools and permissions

- Shell, apps, plugins, memories, and permission requests are disabled.
- No file edits or further delegation.

### Output

```json
{
  "status": "complete | blocked",
  "sections": [{ "id": "string", "content": {} }],
  "missing_information": [],
  "conflicts": [],
  "assumptions_requiring_confirmation": []
}
```

### Completion conditions

- Every supplied content requirement is organized or reported missing.
- No unsupported claim is introduced.
- Essential missing or contradictory information produces `blocked`.

## Development agent

### Inputs

- Brief and acceptance criteria.
- Validated content handoff.
- Explicit output directory.
- Design reference when required.
- Review findings during a correction round.

### Responsibilities

- Confirm required inputs before editing.
- Inspect supplied designs through inherited Figma tools when required and available.
- Implement only in the allowed assignment output directory.
- Preserve supplied content and unrelated files.
- Address only routed findings during corrections.

### Tools and permissions

- Shell, apps, and plugins are enabled.
- Figma use is read-only by project policy.
- Permission requests and memories are disabled.
- No commit, push, deployment, publishing, or further delegation.

### Output

```json
{
  "status": "complete | blocked | failed",
  "files_changed": ["relative/path"],
  "checks_performed": [
    { "check": "string", "result": "passed | failed | not_verified", "evidence": "string" }
  ],
  "implementation_notes": [],
  "unresolved_requirements": []
}
```

### Completion conditions

- Requested files exist only inside the allowed output directory.
- Claimed checks have evidence.
- Missing Figma access or context is reported as `blocked`, not mocked.

## Review agent

### Inputs

- Brief and acceptance criteria.
- Validated content and development handoffs.
- Local preview URL and implementation artifacts.
- Design reference when visual comparison requires it.

### Responsibilities

- Verify every acceptance criterion.
- Use inherited Playwright MCP for browser checks when required and available.
- Use inherited read-only Figma tools for design comparison when required and available.
- Capture evidence and distinguish pass, fail, and not verified.
- Recommend only concrete, in-scope corrections.

### Tools and permissions

- Apps and plugins are enabled; shell is disabled.
- Browser activity is limited to the supplied local preview and assignment-required resources.
- No implementation edits, external publishing, or further delegation.

### Output

```json
{
  "status": "complete | blocked | failed",
  "criteria": [
    { "id": "string", "result": "pass | fail | not_verified", "evidence": ["string"] }
  ],
  "findings": [
    {
      "criterion_id": "string",
      "severity": "critical | major | minor",
      "description": "string",
      "suggested_correction": "string"
    }
  ],
  "evidence_paths": ["relative/path"],
  "recommendation": "ready | needs_correction | blocked"
}
```

### Completion conditions

- Every criterion has exactly one result.
- Failures and unverified checks identify evidence or the exact limitation.
- `ready` is used only when every required criterion passes with evidence.

## Handoff sequence

```text
Primary orchestrator
  -> content_agent
  -> validate content JSON
  -> development_agent
  -> validate files and development JSON
  -> start controlled local preview
  -> review_agent
  -> validate review JSON
  -> if needed: development_agent correction -> review_agent recheck
  -> repeat correction/recheck at most once more
  -> final handoff for human review
```

Dependent stages are sequential. The orchestrator may reuse a completed agent thread for a correction or spawn the same configured role again with the prior handoff and exact findings. Correction round count increments only when development is asked to change the implementation after a review.

## Limits

- One initial implementation.
- At most two correction rounds.
- At most one retry for a transient model or tool failure.
- No retries for authentication failure, missing inputs, or unsupported capabilities.
- 120 seconds per model turn unless the parent environment imposes a lower limit.
- 60 seconds per MCP tool call.
- 15 minutes overall per assignment run unless explicitly changed before execution.
- Three concurrently open subagent threads maximum, excluding the primary thread.

Reaching a limit is not success.

## State and evidence

Store future assignment runs under `runs/<run-id>/`:

```text
brief.md
metadata.json
state.json
content.json
design-context/
output/
reviews/
screenshots/
events.jsonl
```

Record model/configuration identifiers, stage times, agent status, tool outcomes, correction count, files, and evidence without secrets. Do not claim automatic resume unless it is implemented and tested.

## Final statuses

- `ready_for_human_review`: all required checks passed with evidence.
- `needs_attention`: failed or unverified criteria remain after the correction limit.
- `blocked`: a required input, capability, or connection prevented completion.
- `failed`: an unrecoverable execution error prevented completion.

Human acceptance is outside the agent team's authority.
