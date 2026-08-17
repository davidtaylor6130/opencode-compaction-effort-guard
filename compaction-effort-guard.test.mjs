import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import plugin from "./compaction-effort-guard.mjs";

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "compaction-effort-guard-"));
  const stateFile = path.join(directory, "state.json");
  return { directory, stateFile };
}

test("forces compaction reasoning to none after any session variant", async () => {
  const { directory, stateFile } = fixture();
  try {
    const hooks = await plugin({}, { stateFile });
    for (const effort of ["low", "medium", "high", "xhigh", "none"]) {
      const output = { options: { reasoningEffort: effort } };
      await hooks["chat.params"]({ agent: "compaction" }, output);
      assert.equal(output.options.reasoningEffort, "none");
    }
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});

test("does not change normal agents", async () => {
  const { directory, stateFile } = fixture();
  try {
    const hooks = await plugin({}, { stateFile });
    const output = { options: { reasoningEffort: "xhigh" } };
    await hooks["chat.params"]({ agent: "build" }, output);
    assert.equal(output.options.reasoningEffort, "xhigh");
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});

test("registers selector-style slash commands", async () => {
  const { directory, stateFile } = fixture();
  try {
    const hooks = await plugin({}, { stateFile });
    const config = {};
    await hooks.config(config);
    for (const name of [
      "compaction-effort",
      "compaction-effort-none",
      "compaction-effort-low",
      "compaction-effort-medium",
      "compaction-effort-high",
      "compaction-effort-xhigh",
      "compaction-effort-off",
      "compaction-effort-status",
    ]) {
      assert.ok(config.command[name], name + " should be registered");
    }
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});

test("slash command persists effort and the final hook enforces it", async () => {
  const { directory, stateFile } = fixture();
  try {
    const hooks = await plugin({}, { stateFile });
    const commandOutput = { parts: [{ type: "text", text: "original" }] };
    await hooks["command.execute.before"](
      { command: "compaction-effort-medium", arguments: "" },
      commandOutput,
    );
    assert.equal(commandOutput.parts[0].text, "Reply exactly: Compaction effort: medium");

    const requestOutput = { options: { reasoningEffort: "xhigh" } };
    await hooks["chat.params"]({ agent: "compaction" }, requestOutput);
    assert.equal(requestOutput.options.reasoningEffort, "medium");
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});

test("status reports persisted effort and off maps to none", async () => {
  const { directory, stateFile } = fixture();
  try {
    const hooks = await plugin({}, { stateFile });
    const setOutput = { parts: [{ type: "text", text: "original" }] };
    await hooks["command.execute.before"](
      { command: "compaction-effort", arguments: "off" },
      setOutput,
    );
    assert.equal(setOutput.parts[0].text, "Reply exactly: Compaction effort: none");

    const statusOutput = { parts: [{ type: "text", text: "original" }] };
    await hooks["command.execute.before"](
      { command: "compaction-effort-status", arguments: "" },
      statusOutput,
    );
    assert.equal(statusOutput.parts[0].text, "Reply exactly: Compaction effort: none");
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
});
