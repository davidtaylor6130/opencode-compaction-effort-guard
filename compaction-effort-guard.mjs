// Prevent session reasoning variants from leaking into OpenCode's hidden
// compaction agent. chat.params runs after model, agent, and variant merging.
export default async () => ({
  "chat.params": async (input, output) => {
    if (input.agent !== "compaction") return;
    output.options.reasoningEffort = "none";
  },
});
