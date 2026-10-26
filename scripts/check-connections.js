import { createRequire } from "node:module";
import path from "node:path";
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { loadConfig, required } from "../src/config.js";

const require = createRequire(import.meta.url);
const results = [];

function record(name, status, detail) {
  results.push({ name, status, detail });
  const marker = status === "passed" ? "PASS" : "FAIL";
  console.log(`${marker} ${name}: ${detail}`);
}

function safeError(error) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.startsWith("401 ")) {
    return "401 OpenAI rejected OPENAI_API_KEY.";
  }

  return message
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted OpenAI key]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]");
}

async function withTimeout(label, task, timeoutMs = 60_000) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort(`${label} timed out`);
      reject(new Error(`${label} timed out after ${timeoutMs} ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([task(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}

async function checkOpenAI(config) {
  const client = new OpenAI({ apiKey: required("OPENAI_API_KEY", config.apiKey) });
  const model = await withTimeout("OpenAI model check", (signal) =>
    client.models.retrieve(config.model, { signal }),
  );

  record("OpenAI model", "passed", `model ${model.id} is accessible`);
}

async function checkFigma(config) {
  const accessToken = required("FIGMA_MCP_ACCESS_TOKEN", config.accessToken);
  const client = new Client({ name: "first-agent-team-check", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(config.url, {
    requestInit: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  try {
    await withTimeout("Figma MCP connection", () => client.connect(transport));
    const { tools } = await withTimeout("Figma MCP tool list", () => client.listTools());
    const whoami = tools.find((tool) => tool.name === "whoami");

    if (!whoami) {
      throw new Error("connected, but the read-only whoami tool is not available");
    }

    const response = await withTimeout("Figma MCP whoami", () =>
      client.callTool({ name: whoami.name, arguments: {} }),
    );

    if (response.isError) {
      throw new Error("the read-only whoami call returned an MCP error");
    }

    record("Figma MCP", "passed", `connected; ${tools.length} tools listed; whoami succeeded`);
  } finally {
    await client.close().catch(() => {});
  }
}

async function checkPlaywright(config) {
  const client = new Client({ name: "first-agent-team-check", version: "0.1.0" });
  const packagePath = require.resolve("@playwright/mcp/package.json");
  const cliPath = path.join(path.dirname(packagePath), "cli.js");
  const args = [
    cliPath,
    "--headless",
    "--isolated",
    "--allowed-origins",
    config.allowedOrigins.join(";"),
  ];
  const transport = new StdioClientTransport({
    command: process.execPath,
    args,
    stderr: "pipe",
  });

  try {
    await withTimeout("Playwright MCP connection", () => client.connect(transport));
    const { tools } = await withTimeout("Playwright MCP tool list", () => client.listTools());
    const browserTabs = tools.find((tool) => tool.name === "browser_tabs");

    if (!browserTabs) {
      throw new Error("connected, but the read-only browser_tabs tool is not available");
    }

    const response = await withTimeout("Playwright MCP tab list", () =>
      client.callTool({ name: browserTabs.name, arguments: { action: "list" } }),
    );

    if (response.isError) {
      const detail = response.content
        ?.filter((item) => item.type === "text")
        .map((item) => item.text)
        .join(" ");
      throw new Error(
        `the read-only browser_tabs list call returned an MCP error${detail ? `: ${detail}` : ""}`,
      );
    }

    record(
      "Playwright MCP",
      "passed",
      `connected; ${tools.length} tools listed; browser_tabs list succeeded`,
    );
  } finally {
    await client.close().catch(() => {});
  }
}

async function main() {
  const config = loadConfig();

  for (const [name, check, section] of [
    ["OpenAI model", checkOpenAI, config.openai],
    ["Figma MCP", checkFigma, config.figma],
    ["Playwright MCP", checkPlaywright, config.playwright],
  ]) {
    try {
      await check(section);
    } catch (error) {
      record(name, "failed", safeError(error));
    }
  }

  if (results.some((result) => result.status === "failed")) {
    process.exitCode = 1;
  }
}

await main();
