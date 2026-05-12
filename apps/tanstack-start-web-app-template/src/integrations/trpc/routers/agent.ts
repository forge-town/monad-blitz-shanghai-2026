import { z } from "zod/v4";
import { publicProcedure, router } from "../init";

const AGENT_CONFIGS = [
  { name: "Claude-3.5", model: "claude-sonnet-4-20250514", temperature: 0.3 },
  { name: "Claude-Creative", model: "claude-sonnet-4-20250514", temperature: 0.9 },
  { name: "Claude-Precise", model: "claude-sonnet-4-20250514", temperature: 0.0 },
] as const;

const ANTHROPIC_BASE = process.env.ANTHROPIC_BASE_URL?.replace(/\/+$/, "") ?? "https://api.anthropic.com";

async function callClaude(apiKey: string, prompt: string, config: typeof AGENT_CONFIGS[number]) {
  const response = await fetch(`${ANTHROPIC_BASE}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 512,
      temperature: config.temperature,
      messages: [
        {
          role: "user",
          content: `You are an AI agent named "${config.name}" completing a task. Provide your best result. Be concise and direct. Only output the result.\n\nTask: ${prompt}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error (${config.name}): ${response.status} ${errorBody.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content?.[0]?.text?.trim() ?? "";
}

export const agentRouter = router({
  // Single agent solve
  solve: publicProcedure
    .input(z.object({ prompt: z.string().min(1), agentIndex: z.number().int().min(0).max(4).optional() }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

      const config = AGENT_CONFIGS[input.agentIndex ?? 0] ?? AGENT_CONFIGS[0];
      const answer = await callClaude(apiKey, input.prompt, config);
      return { answer, agentName: config.name };
    }),

  // Multiple agents solve in parallel — core of cross-validation
  solveParallel: publicProcedure
    .input(z.object({ prompt: z.string().min(1), agentCount: z.number().int().min(2).max(5) }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

      const configs = AGENT_CONFIGS.slice(0, input.agentCount);
      const results = await Promise.all(
        configs.map(async (config) => {
          try {
            const answer = await callClaude(apiKey, input.prompt, config);
            return { agentName: config.name, answer, error: null };
          } catch (err) {
            return { agentName: config.name, answer: "", error: (err as Error).message };
          }
        }),
      );

      return { results };
    }),

  // Judge: evaluate results and determine consensus cluster
  judge: publicProcedure
    .input(z.object({
      taskDescription: z.string(),
      results: z.array(z.object({
        agentName: z.string(),
        answer: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

      const resultsText = input.results
        .map((r, i) => `Agent ${i + 1} (${r.agentName}): "${r.answer}"`)
        .join("\n");

      const response = await fetch(`${ANTHROPIC_BASE}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          temperature: 0,
          messages: [
            {
              role: "user",
              content: `You are a judge evaluating multiple AI agents' responses to the same task. Determine which agents produced semantically equivalent results (the consensus cluster) and which are outliers.

Task: "${input.taskDescription}"

Results:
${resultsText}

Respond ONLY with valid JSON in this exact format, no other text:
{"consensus": [0, 1], "outliers": [2], "reasoning": "brief explanation"}

The numbers are 0-based indices of the agents. The consensus cluster should contain agents whose answers are semantically similar/correct. Outliers gave significantly different or wrong answers.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Judge API error: ${response.status} ${errorBody.slice(0, 200)}`);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      const text = data.content?.[0]?.text?.trim() ?? "";

      try {
        const judgment = JSON.parse(text) as {
          consensus: number[];
          outliers: number[];
          reasoning: string;
        };
        return judgment;
      } catch {
        return { consensus: [0], outliers: [], reasoning: "Failed to parse judge response: " + text.slice(0, 200) };
      }
    }),
});
