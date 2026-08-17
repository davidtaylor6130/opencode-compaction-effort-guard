import assert from "node:assert/strict";
import test from "node:test";
import plugin from "./compaction-effort-guard.mjs";

test("forces compaction reasoning to none after any session variant", async () => {
  const hooks = await plugin();
  for (const effort of ["low", "medium", "high", "xhigh", "none"]) {
    const output = { options: { reasoningEffort: effort } };
    await hooks["chat.params"]({ agent: "compaction" }, output);
    assert.equal(output.options.reasoningEffort, "none");
  }
});

test("does not change normal agents", async () => {
  const hooks = await plugin();
  const output = { options: { reasoningEffort: "xhigh" } };
  await hooks["chat.params"]({ agent: "build" }, output);
  assert.equal(output.options.reasoningEffort, "xhigh");
});
