const PLACEHOLDER_PREFIX = "replace_with_";

export function required(name, value = process.env[name]?.trim()) {
  if (!value || value.startsWith(PLACEHOLDER_PREFIX)) {
    throw new Error(`${name} is missing or still contains its placeholder value.`);
  }

  return value;
}

function csv(name, fallback) {
  const value = process.env[name]?.trim() || fallback;
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

export function loadConfig() {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY?.trim(),
      model: process.env.OPENAI_MODEL?.trim() || "gpt-6-luna",
    },
    figma: {
      url: new URL(process.env.FIGMA_MCP_URL?.trim() || "https://mcp.figma.com/mcp"),
      accessToken: process.env.FIGMA_MCP_ACCESS_TOKEN?.trim(),
    },
    playwright: {
      allowedOrigins: csv(
        "PLAYWRIGHT_ALLOWED_ORIGINS",
        "http://127.0.0.1:*,http://localhost:*",
      ),
    },
  };
}
