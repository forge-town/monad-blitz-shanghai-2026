import { z } from "zod/v4";
import { publicProcedure, router } from "../init";

export const agentRouter = router({
  solve: publicProcedure
    .input(z.object({ prompt: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not configured");
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 256,
          messages: [
            {
              role: "user",
              content: `You are an AI agent being tested on your capabilities. Answer the following challenge concisely and precisely. Only output the answer, nothing else.\n\nChallenge: ${input.prompt}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Claude API error: ${response.status} ${errorBody.slice(0, 200)}`);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      const answer = data.content?.[0]?.text?.trim() ?? "";

      return { answer };
    }),
});
