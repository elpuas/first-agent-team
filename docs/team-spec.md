# Agent team specification

## Objective

Build a reusable team that receives a landing-page brief and a Figma design reference, implements the page, and verifies the result.

The first assignment is Café Roble. Business names, copy, colors, and sections must come from the assignment inputs rather than being hardcoded into the team.

This is an explicitly orchestrated workflow. It does not claim to be a dynamically self-organizing team.

## Architecture

Use a Node.js coordinator with distinct agent executions for:
1. Content preparation.
2. Development.
3. Review.

One model may serve all roles. Each execution receives only the instructions, context, and tools required for its responsibility.

Start with plain JavaScript and a minimal SDK setup. Confirm the model, SDK, and MCP integration approach during the initial technical investigation.

## Inputs

Each run receives:
- An assignment brief.
- A Figma reference URL and target page or node, where available.
- A local output directory.
- Model and MCP configuration.
- Explicit execution limits.

Validate required inputs and tool connectivity before starting generation.

If the design reference or another required input is missing or inaccessible, stop with an actionable explanation. Do not silently substitute a different design.

## Responsibilities

### Orchestrator

The orchestrator is application logic responsible for:
- Loading inputs and acceptance criteria.
- Checking prerequisites.
- Invoking agents in the correct order.
- Validating structured outputs.
- Persisting state and artifacts.
- Routing review findings to the development agent.
- Enforcing execution limits.
- Returning a truthful final status.

It must not accept an agent's success statement as sufficient evidence of completion.

### Content agent

Inputs:
- Assignment brief.
- Content requirements and supplied business facts.

Responsibilities:
- Organize copy by section.
- Preserve supplied facts, names, prices, and hours.
- Identify missing or contradictory information.
- Draft new copy only when the brief permits it.

Outputs:
- Structured section content.
- Missing information or conflicts.
- Any assumptions requiring confirmation.

Tools:
- No MCP tools required initially.

### Development agent

Inputs:
- Assignment brief and acceptance criteria.
- Prepared content.
- Figma reference.
- Existing implementation and review findings during corrections.

Responsibilities:
- Inspect the design through Figma MCP.
- Implement the page using semantic HTML and CSS.
- Preserve editable text and supplied content.
- Address review findings within the allowed correction rounds.

Outputs:
- Proposed local files and their contents.
- Implementation notes.
- Unresolved requirements or design limitations.

Tools:
- Read-only Figma MCP tools.
- Controlled access to assignment output files.

The orchestrator must validate proposed file paths before writing. Do not allow writes outside the run's output directory.

### Review agent

Inputs:
- Assignment brief and acceptance criteria.
- Prepared content.
- Figma reference and relevant design context.
- Local preview URL and implementation artifacts.

Responsibilities:
- Inspect the running page through Playwright MCP.
- Compare the result with the brief and design.
- Check desktop and mobile layouts, navigation, keyboard behavior, and other specified criteria.
- Capture screenshots.
- Report concrete findings and checks it could not complete.

Outputs:
- A result for each acceptance criterion: pass, fail, or not verified.
- Findings with criterion, evidence, severity, and suggested correction.
- Paths to browser evidence.
- A recommendation: ready, needs correction, or blocked.

Tools:
- Playwright MCP for browser inspection.
- Read-only Figma MCP access for visual comparison when needed.
- Read access to assignment artifacts.

Review tools must not modify the implementation.

## MCP prerequisites

Document how the tutorial agents connect to each MCP server at runtime.

For each connection, record:
- Required installation and authentication.
- Supported transport.
- Available and permitted tools.
- Connection verification steps.
- Relevant limitations.

Figma Make compatibility must be tested with the actual reference. Do not assume it exposes the same design information as a Figma Design file.

If another reference format or file type is required, record that finding and obtain the appropriate input before continuing.

## Structured handoffs

Define and validate schemas for agent outputs.

At minimum:
- Content: sections, missing information, conflicts.
- Development: files, notes, unresolved requirements.
- Review: criterion results, findings, evidence, recommendation.

Malformed output must not be passed directly to the next stage.

Keep outputs inspectable as JSON alongside generated files.

## Workflow

1. Validate configuration, inputs, and MCP connectivity.
2. Prepare content.
3. Stop if essential content is missing or contradictory.
4. Inspect the design and implement the page.
5. Serve the output through a controlled local preview.
6. Review the page in the browser.
7. Route actionable findings to development.
8. Repeat review after a correction.
9. Return the final status with evidence and remaining limitations.

Start sequentially because each stage depends on previous outputs. Introduce parallel work only when a concrete independent task justifies it.

## Limits and failure handling

Initial defaults:
- One initial implementation.
- At most two correction rounds.
- At most one retry per transient model or tool failure.
- A 120-second timeout per model request.
- A 60-second timeout per MCP tool call.
- A 15-minute overall run limit.
- Explicit finite output limits for every model request.

Make these limits configurable and document any changes made during the experiment.

Do not retry authentication failures, missing inputs, or unsupported capabilities as though they were transient.

After a timeout, cancel pending work where supported. Do not start a duplicate browser or file operation unless the previous operation's outcome is known.

If budget enforcement is implemented, distinguish estimated cost from billed cost and document how the limit is calculated.

## State and artifacts

Store each run under a unique directory:

runs/<run-id>/
- brief.md
- metadata.json
- state.json
- content.json
- design-context/
- output/
- reviews/
- screenshots/
- events.jsonl

Persist status after each stage.

Record:
- Model and relevant configuration.
- Stage start and end times.
- Tool actions and outcomes, with sensitive data removed.
- Token usage when provided.
- Correction count.
- Final status and outstanding findings.

Automatic resume is optional. Never claim that an interrupted run is safely resumable unless that behavior is implemented and tested.

## Verification

Use concrete checks alongside agent judgment:
- Validate structured outputs and file paths.
- Confirm expected files exist.
- Verify supplied facts against generated copy.
- Check the local page in a browser.
- Inspect screenshots against the design reference.
- Record evidence for each acceptance criterion.

Do not infer full accessibility compliance from automated checks or an agent review.

Human review remains part of the tutorial: Alfredo reviews the final page and evidence before the result is described as accepted.

## Final statuses

- `ready_for_human_review`: all required checks passed, with evidence.
- `needs_attention`: criteria remain failed or unverified after the correction limit.
- `blocked`: a required input, capability, or connection prevented completion.
- `failed`: an unrecoverable execution error prevented completion.

Reaching a limit is not success.

## Evidence for the article

Retain:
- Prompts and assignment inputs.
- Structured agent outputs.
- Initial and corrected implementations.
- Browser screenshots and review findings.
- Actual errors and fixes.
- Elapsed time and available usage data.
- Integration limitations and reproducible setup instructions.

Report cost only when supported by usage records and an identified pricing source.

Never invent a failure for the article. A successful first run is also a valid result.