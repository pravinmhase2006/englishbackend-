import { FastifyRequest, FastifyReply } from 'fastify';
import { AiService } from '../services/ai.service';
import { sendSuccess, sendError } from '../utils/response.utils';

export class AiController {
  /**
   * POST /api/v1/ai/chat
   * Chat with Maya AI tutor using Gemini 1.5 Flash (with smart conversational fallback).
   */
  static async chat(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = (request.body || {}) as {
        message?: string;
        topicTitle?: string;
        cefrLevel?: string;
        history?: Array<{ role: string; content: string }>;
      };

      const userMessage = (body.message || '').trim();
      if (!userMessage) {
        return sendError(reply, 'Field "message" is required', 400);
      }

      const topicTitle = body.topicTitle || 'General English Practice';
      const cefrLevel = body.cefrLevel || 'B1';

      const result = await AiService.generateTutorResponse(
        userMessage,
        topicTitle,
        cefrLevel
      );

      return sendSuccess(reply, {
        message: result.aiText,
        coachTip: result.coachTip,
        fluencyScore: result.fluencyScore,
        speaker: 'Maya (US Native)',
        topicTitle,
        cefrLevel,
        timestamp: new Date().toISOString(),
      }, 'AI response generated successfully');
    } catch (err: any) {
      return sendError(reply, err.message || 'AI chat failed', 500);
    }
  }

  /**
   * POST /api/v1/ai/generate
   * Generates arbitrary educational content, exercises, or explanations.
   */
  static async generate(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = (request.body || {}) as {
        prompt?: string;
        systemInstruction?: string;
        maxTokens?: number;
      };

      const prompt = (body.prompt || '').trim();
      if (!prompt) {
        return sendError(reply, 'Field "prompt" is required', 400);
      }

      const tutor = await AiService.generateTutorResponse(
        prompt,
        'Educational Assistance',
        'B2'
      );

      return sendSuccess(reply, {
        text: tutor.aiText,
        tip: tutor.coachTip,
        prompt,
      }, 'Content generated successfully');
    } catch (err: any) {
      return sendError(reply, err.message || 'Generation failed', 500);
    }
  }

  /**
   * POST /api/v1/ai/stream
   * Streams response chunks via text/event-stream SSE.
   */
  static async stream(request: FastifyRequest, reply: FastifyReply) {
    const body = (request.body || {}) as { message?: string };
    const userMessage = (body.message || 'Hello').trim();

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    const tutor = await AiService.generateTutorResponse(
      userMessage,
      'Conversational Stream',
      'B1'
    );

    const words = tutor.aiText.split(' ');
    for (let i = 0; i < words.length; i++) {
      const chunk = JSON.stringify({ token: words[i] + ' ', done: i === words.length - 1 });
      reply.raw.write(`data: ${chunk}\n\n`);
    }

    reply.raw.end();
  }
}
