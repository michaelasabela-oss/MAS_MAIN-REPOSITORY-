import { GoogleGenAI } from '@google/genai';

// AI Fleet Dispatcher & Road Guide: "Kuya Jun - Chief Pinoy Logistics Dispatcher"
export async function askLogisticsDispatcher(userQuestion: string, context?: { truck?: string; cargo?: string; route?: string }): Promise<string> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  // If no API key is provided, provide high-quality localized guidance
  if (!apiKey) {
    return getOfflineDispatcherAdvice(userQuestion, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are "Kuya Jun", a friendly, veteran Filipino truck driver, logistics fleet dispatcher, and master diesel mechanic with 25 years of experience hauling across Metro Manila (EDSA, Roxas Blvd, Port Area) and provincial routes (Kennon Road, NLEX, SCTEX, Maharlika Highway).
You give kids, students, and apprentice drivers practical, engaging, and educational explanations about logistics, cargo weight distribution, air brake pneumatics, engine maintenance, and Philippine road safety.
Include friendly Filipino touches (like 'Mabuhay!', 'Ingat sa byahe!') and practical mechanics tips. Keep responses punchy, educational, and warm (under 120 words).`;

    const prompt = `Context:
Truck: ${context?.truck || 'Heavy Duty Truck'}
Cargo: ${context?.cargo || 'General Freight'}
Current Route: ${context?.route || 'Philippine Highway'}

Question/Situation: ${userQuestion}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return response.text || getOfflineDispatcherAdvice(userQuestion, context);
  } catch {
    return getOfflineDispatcherAdvice(userQuestion, context);
  }
}

function getOfflineDispatcherAdvice(query: string, context?: { truck?: string; cargo?: string; route?: string }): string {
  const q = query.toLowerCase();

  if (q.includes('air brake') || q.includes('preno') || q.includes('brake')) {
    return `Mabuhay! In heavy trucks, air brakes use compressed air stored in high-pressure steel tanks. Never drive if your air gauge is below 90 PSI! Also, always pull the drain ring valve under your air reservoir daily—humidity in the Philippines causes moisture to build up, which can damage brake valves if not drained!`;
  }

  if (q.includes('baguio') || q.includes('kennon') || q.includes('mountain') || q.includes('zigzag') || q.includes('jake')) {
    return `Ingat sa Kennon Road! When descending steep mountains with heavy loads, never ride the foot brake continuously or your brake drums will overheat and glaze over! Instead, downshift into low gear (1st or 2nd) and engage your Jake Exhaust Brake (engine retarder) to let engine compression hold back the weight!`;
  }

  if (q.includes('cargo') || q.includes('karga') || q.includes('weight') || q.includes('load')) {
    return `Logistics Golden Rule: Keep your Center of Gravity low and centered! Put the heaviest pallets (like steel or rice sacks) directly over the tandem drive axles. If too much weight is at the rear, your steering tires lose grip; if too high, your truck will lean dangerously on highway turns!`;
  }

  if (q.includes('oil') || q.includes('engine') || q.includes('coolant') || q.includes('overheat')) {
    return `Daily Pre-Trip Inspection (BLOWBAGETS): Battery, Lights, Oil, Water, Brakes, Air, Gas, Engine, Tire, Self! Always pull your dipstick when the engine is cool on flat ground. Golden amber means fresh oil; pitch black with gritty residue means it's time for an oil change at the garage!`;
  }

  return `Chief Dispatcher Kuya Jun here! For ${context?.route || 'your route'} hauling ${context?.cargo || 'your cargo'}, remember to keep at least 3 truck-lengths of following distance in Metro Manila traffic. Check your tire PSI at 110 PSI before entering NLEX or SCTEX. Byahe nang ligtas at mabuhay ang Pinoy trucker!`;
}
