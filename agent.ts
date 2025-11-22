import { type JobContext, WorkerOptions, cli, defineAgent, llm, VoicePipelineAgent } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    console.log('Agent connected to room:', ctx.room.name);

    // 1. Setup the participant entry (the agent itself)
    // The agent joins as a participant in the room.
    const participant = await ctx.waitForParticipant();

    // 2. Initialize the Voice Pipeline
    // This handles VAD -> STT -> LLM -> TTS automatically.
    const agent = new VoicePipelineAgent(
      // VAD: Voice Activity Detection (detects when user starts/stops speaking)
      await silero.VAD.load(),
      // STT: Speech-to-Text (Transcribes user audio)
      // We use OpenAI Whisper here, but Deepgram is faster for production.
      new openai.STT(),
      // LLM: The Brain (Generates text responses)
      new openai.LLM({
        model: 'gpt-4o-mini', // Cost-effective and fast
      }),
      // TTS: Text-to-Speech (Turns text back into audio)
      new openai.TTS() 
    );

    // 3. Configure the Support Persona
    // This prompts the agent to act like a support rep.
    const chatCtx = new llm.ChatContext().append({
      role: llm.ChatRole.SYSTEM,
      text: `You are a helpful support agent for TechFlow. Keep answers short.`
    });
    agent.ctx = chatCtx;

    // 4. Start the Agent
    await agent.start(ctx.room, participant);
    console.log('🚀 Agent started');

    // --- FIX: Add Delay ---
    console.log('⏳ Warming up audio...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // 5. Greet the user immediately upon joining
    await agent.say('Hi there! I am the TechFlow support assistant. How can I help you today?', true);
    console.log('Agent started and ready to chat.');
  },
});

// Enable running directly via `tsx agent.ts dev`
cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));