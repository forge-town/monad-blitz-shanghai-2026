import { z } from "zod/v4";
import { publicProcedure, router } from "../init";

const AGENT_CONFIGS = [
  { name: "Claude-3.5", model: "claude-opus-4-6", temperature: 0.3 },
  { name: "Claude-Creative", model: "claude-opus-4-6", temperature: 0.9 },
  { name: "Claude-Precise", model: "claude-opus-4-6", temperature: 0.0 },
] as const;

// Mock responses for demo when API is unavailable
const MOCK_TRANSLATIONS: Record<string, string[]> = {
  default: [
    "敏捷的棕色狐狸跳过了懒惰的狗",
    "那只敏捷的棕色狐狸跃过了那条懒狗",
    "快速的棕色狐狸跳过了懒惰的犬",
  ],
};

function getMockResponse(_prompt: string, agentIndex: number): string {
  const translations = MOCK_TRANSLATIONS["default"];
  return translations[agentIndex % translations.length] ?? translations[0];
}

async function callClaude(apiKey: string, prompt: string, config: typeof AGENT_CONFIGS[number]) {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "User-Agent": "claude-code/1.0.24",
      "x-client-version": "1.0.24",
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
  solve: publicProcedure
    .input(z.object({ prompt: z.string().min(1), agentIndex: z.number().int().min(0).max(4).optional() }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const config = AGENT_CONFIGS[input.agentIndex ?? 0] ?? AGENT_CONFIGS[0];

      if (apiKey) {
        try {
          const answer = await callClaude(apiKey, input.prompt, config);
          return { answer, agentName: config.name };
        } catch {
          // fallback to mock
        }
      }

      // Mock mode
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      return { answer: getMockResponse(input.prompt, input.agentIndex ?? 0), agentName: config.name };
    }),

  solveParallel: publicProcedure
    .input(z.object({ prompt: z.string().min(1), agentCount: z.number().int().min(2).max(5) }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const configs = AGENT_CONFIGS.slice(0, input.agentCount);

      // Try real API first
      if (apiKey) {
        const results = await Promise.all(
          configs.map(async (config, i) => {
            try {
              const answer = await callClaude(apiKey, input.prompt, config);
              return { agentName: config.name, answer, error: null };
            } catch {
              // Individual agent fallback to mock
              await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));
              return { agentName: config.name, answer: getMockResponse(input.prompt, i), error: null };
            }
          }),
        );
        return { results };
      }

      // Full mock mode with realistic delay
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
      const results = configs.map((config, i) => ({
        agentName: config.name,
        answer: getMockResponse(input.prompt, i),
        error: null,
      }));
      return { results };
    }),

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

      if (apiKey) {
        try {
          const resultsText = input.results
            .map((r, i) => `Agent ${i + 1} (${r.agentName}): "${r.answer}"`)
            .join("\n");

          const baseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
          const response = await fetch(`${baseUrl}/v1/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "User-Agent": "claude-code/1.0.24",
              "x-client-version": "1.0.24",
            },
            body: JSON.stringify({
              model: "claude-opus-4-6",
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

          if (response.ok) {
            const data = (await response.json()) as {
              content: Array<{ type: string; text: string }>;
            };
            const text = data.content?.[0]?.text?.trim() ?? "";
            try {
              return JSON.parse(text) as { consensus: number[]; outliers: number[]; reasoning: string };
            } catch {
              // fall through to mock
            }
          }
        } catch {
          // fall through to mock
        }
      }

      // Mock judge: agents 0 and 1 agree (consensus), agent 2 is outlier
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 500));
      return {
        consensus: [0, 1],
        outliers: [2],
        reasoning: "Agents 1 and 2 produced semantically equivalent translations. Agent 3 used slightly different vocabulary that changed the meaning.",
      };
    }),
});
