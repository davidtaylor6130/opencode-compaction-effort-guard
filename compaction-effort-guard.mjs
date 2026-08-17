import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const efforts = ["none", "minimal", "low", "medium", "high", "xhigh"];
const effortSet = new Set(efforts);
const commandName = "compaction-effort";

function normalize(value) {
  const effort = String(value ?? "").trim().toLowerCase();
  if (effort === "off") return "none";
  return effortSet.has(effort) ? effort : undefined;
}

function defaultStateFile() {
  const config = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
  return path.join(config, "opencode", "compaction-effort-guard.json");
}

function readEffort(stateFile, fallback) {
  try {
    const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
    return normalize(state.reasoningEffort) || fallback;
  } catch {
    return fallback;
  }
}

function writeEffort(stateFile, effort) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify({ reasoningEffort: effort }, null, 2) + "\n", { mode: 0o600 });
}

function replacePrompt(output, text) {
  const part = output.parts.find((item) => item.type === "text");
  if (part) part.text = text;
}

function requestedAction(input) {
  if (input.command === commandName) {
    const argument = String(input.arguments ?? "").trim().toLowerCase();
    if (!argument || argument === "status") return { type: "status" };
    const effort = normalize(argument);
    return effort ? { type: "set", effort } : { type: "invalid", argument };
  }

  if (!input.command.startsWith(commandName + "-")) return;
  const suffix = input.command.slice(commandName.length + 1);
  if (suffix === "status") return { type: "status" };
  const effort = normalize(suffix);
  return effort ? { type: "set", effort } : undefined;
}

function registerCommands(config) {
  config.command ||= {};
  config.command[commandName] = {
    description: "Set compaction effort: none, minimal, low, medium, high, xhigh, or status",
    template: "Set OpenCode compaction reasoning effort to $ARGUMENTS and confirm it in one short line. Do not call tools.",
  };

  for (const effort of [...efforts, "off"]) {
    config.command[commandName + "-" + effort] = {
      description: "Set compaction reasoning effort to " + effort,
      template: "Confirm in one short line that compaction reasoning effort is " + effort + ". Do not call tools.",
    };
  }

  config.command[commandName + "-status"] = {
    description: "Show the current compaction reasoning effort",
    template: "Report the current compaction reasoning effort in one short line. Do not call tools.",
  };
}

export default async (_input = {}, pluginOptions = {}) => {
  const fallback = normalize(pluginOptions.defaultEffort) || "none";
  const stateFile = pluginOptions.stateFile || defaultStateFile();

  return {
    config: async (config) => registerCommands(config),

    "command.execute.before": async (input, output) => {
      const action = requestedAction(input);
      if (!action) return;

      if (action.type === "invalid") {
        replacePrompt(output, "Reply exactly: Invalid compaction effort: " + action.argument + ". Use none, minimal, low, medium, high, xhigh, off, or status.");
        return;
      }

      if (action.type === "set") writeEffort(stateFile, action.effort);
      const current = readEffort(stateFile, fallback);
      replacePrompt(output, "Reply exactly: Compaction effort: " + current);
    },

    "chat.params": async (input, output) => {
      if (input.agent !== "compaction") return;
      output.options.reasoningEffort = readEffort(stateFile, fallback);
    },
  };
};
