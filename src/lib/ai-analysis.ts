// src/lib/ai-analysis.ts - Debugged Version

export interface IckAnalysis {
  sentiment: 'gross' | 'no way' | 'acceptable';
  severity: number; // 1-10
  tags: string[];
  opportunity_score: number; // 1-10
  category: string;
  reasoning: string;
}

export interface AIProvider {
  analyze(content: string): Promise<IckAnalysis>;
}

// Google Gemini Provider (Free!) - IMPROVED
export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(content: string): Promise<IckAnalysis> {
    console.log('🤖 Gemini: Starting analysis for:', content.substring(0, 50) + '...');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${this.getSystemPrompt()}\n\nAnalyze this ick: "${content}"`
            }]
          }],
          generationConfig: {
            temperature: 0.1, // Lower temperature for more consistent results
            maxOutputTokens: 500,
            candidateCount: 1,
          },
        }),
      });

      console.log('🌐 Gemini response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Raw Gemini response:', JSON.stringify(data, null, 2));
      
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        console.error('❌ No AI response received from Gemini');
        throw new Error('No AI response received from Gemini');
      }

      console.log('🔍 AI Response Text:', aiResponse);
      return this.parseResponse(aiResponse);
    } catch (error) {
      console.error('❌ Gemini analysis failed:', error);
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert analyzing user frustrations ("icks") for market research. 

CRITICAL: Respond with ONLY a valid JSON object, no markdown, no code blocks, no extra text:

{
  "sentiment": "gross",
  "severity": 8,
  "tags": ["hygiene", "dating", "turnoff"],
  "opportunity_score": 6,
  "category": "dating",
  "reasoning": "Poor hygiene is a major dating dealbreaker"
}

SENTIMENT RULES (be decisive, don't default to "acceptable"):
- "gross": Physical disgust - bad smells, hygiene issues, bodily functions, unsanitary conditions
- "no way": Behavioral dealbreakers - rudeness, disrespect, cheating, lying, major red flags
- "acceptable": Minor annoyances only - small delays, pet peeves, minor inconveniences

SEVERITY EXAMPLES:
- 1-2: "WiFi takes 5 seconds to connect" 
- 3-4: "Coworker chews loudly"
- 5-6: "People who don't return shopping carts"
- 7-8: "Someone not washing hands after bathroom"
- 9-10: "Partner cheating" or "Boss screaming at employees"

OPPORTUNITY EXAMPLES:
- 1-2: Very personal preferences, hard to solve
- 3-4: Common annoyances, limited market
- 5-6: Solvable problems with decent market
- 7-8: Big problems many people have, clear business opportunity
- 9-10: Massive widespread issues, huge market potential

CATEGORIES: dating, work, tech, social, hygiene, transport, food, shopping, health, lifestyle, family, entertainment, home, finance, education

Be specific and decisive. Most icks should NOT be "acceptable" - they're called "icks" for a reason!`;
  }

  private parseResponse(response: string): IckAnalysis {
    try {
      console.log('🔍 Parsing response:', response);
      
      // Clean the response - remove any markdown, code blocks, or extra text
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      cleanResponse = cleanResponse.replace(/```\s*/g, '');
      
      // Extract JSON object
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response:', cleanResponse);
        throw new Error('No valid JSON found in AI response');
      }
      
      const jsonStr = jsonMatch[0];
      console.log('📝 Extracted JSON string:', jsonStr);
      
      const parsed = JSON.parse(jsonStr);
      console.log('✅ Parsed JSON:', parsed);
      
      const result = {
        sentiment: this.validateSentiment(parsed.sentiment),
        severity: this.clampNumber(parsed.severity, 1, 10),
        tags: this.validateTags(parsed.tags),
        opportunity_score: this.clampNumber(parsed.opportunity_score, 1, 10),
        category: this.validateCategory(parsed.category),
        reasoning: this.validateReasoning(parsed.reasoning)
      };
      
      console.log('🎯 Final analysis result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Failed to parse Gemini response:', error);
      console.error('❌ Raw response was:', response);
      throw new Error(`Invalid AI response format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateSentiment(sentiment: any): 'gross' | 'no way' | 'acceptable' {
    const valid = ['gross', 'no way', 'acceptable'];
    if (typeof sentiment === 'string' && valid.includes(sentiment)) {
      return sentiment as 'gross' | 'no way' | 'acceptable';
    }
    console.warn('⚠️ Invalid sentiment received:', sentiment, 'defaulting to acceptable');
    return 'acceptable';
  }

  private validateTags(tags: any): string[] {
    if (Array.isArray(tags)) {
      return tags.filter(tag => typeof tag === 'string' && tag.trim()).slice(0, 5);
    }
    console.warn('⚠️ Invalid tags received:', tags, 'using default');
    return ['general'];
  }

  private validateCategory(category: any): string {
    if (typeof category === 'string' && category.trim()) {
      return category.trim();
    }
    console.warn('⚠️ Invalid category received:', category, 'using default');
    return 'general';
  }

  private validateReasoning(reasoning: any): string {
    if (typeof reasoning === 'string' && reasoning.trim()) {
      return reasoning.trim();
    }
    console.warn('⚠️ Invalid reasoning received:', reasoning, 'using default');
    return 'AI analysis completed';
  }

  private clampNumber(value: any, min: number, max: number): number {
    let num: number;
    
    if (typeof value === 'number') {
      num = value;
    } else if (typeof value === 'string') {
      num = parseFloat(value);
    } else {
      console.warn('⚠️ Invalid number received:', value, 'using minimum');
      return min;
    }
    
    if (isNaN(num)) {
      console.warn('⚠️ NaN number received:', value, 'using minimum');
      return min;
    }
    
    const result = Math.max(min, Math.min(max, Math.round(num)));
    console.log(`📊 Clamped ${value} to ${result}`);
    return result;
  }
}

// Enhanced Local Provider with better defaults
export class LocalProvider implements AIProvider {
  async analyze(content: string): Promise<IckAnalysis> {
    console.log('🏠 Local: Starting analysis for:', content.substring(0, 50) + '...');
    
    const lower = content.toLowerCase();
    
    // Enhanced keyword detection
    const grossKeywords = ['smell', 'stink', 'gross', 'disgusting', 'vomit', 'puke', 'nasty', 'filthy', 'hygiene', 'unwashed', 'dirty', 'reek'];
    const noWayKeywords = ['rude', 'disrespect', 'cheat', 'lie', 'steal', 'abuse', 'hate', 'never', 'dealbreaker', 'unacceptable', 'terrible', 'awful'];
    const techKeywords = ['app', 'website', 'phone', 'computer', 'software', 'bug', 'crash', 'slow', 'loading'];
    const workKeywords = ['boss', 'coworker', 'meeting', 'work', 'job', 'office', 'colleague', 'manager'];
    const datingKeywords = ['date', 'dating', 'boyfriend', 'girlfriend', 'partner', 'relationship', 'tinder', 'match'];
    
    let sentiment: 'gross' | 'no way' | 'acceptable' = 'acceptable';
    let category = 'general';
    let severity = 3; // Start lower, increase based on keywords
    let opportunity_score = 4; // Start with moderate opportunity
    const tags: string[] = [];
    
    // Determine sentiment and adjust scores
    if (grossKeywords.some(kw => lower.includes(kw))) {
      sentiment = 'gross';
      severity = Math.min(10, severity + 4);
      opportunity_score = Math.min(10, opportunity_score + 2);
      tags.push('hygiene', 'gross');
    } else if (noWayKeywords.some(kw => lower.includes(kw))) {
      sentiment = 'no way';
      severity = Math.min(10, severity + 5);
      opportunity_score = Math.min(10, opportunity_score + 3);
      tags.push('dealbreaker', 'unacceptable');
    } else {
      // Even "acceptable" icks should have some severity
      severity = Math.min(10, severity + 2);
    }
    
    // Determine category and adjust opportunity
    if (techKeywords.some(kw => lower.includes(kw))) {
      category = 'tech';
      opportunity_score = Math.min(10, opportunity_score + 2);
      tags.push('technology', 'digital');
    } else if (workKeywords.some(kw => lower.includes(kw))) {
      category = 'work';
      opportunity_score = Math.min(10, opportunity_score + 1);
      tags.push('workplace', 'professional');
    } else if (datingKeywords.some(kw => lower.includes(kw))) {
      category = 'dating';
      opportunity_score = Math.min(10, opportunity_score + 1);
      tags.push('dating', 'relationships');
    }
    
    // Add general tags if none found
    if (tags.length === 0) {
      tags.push('general', sentiment);
    }
    
    const result = {
      sentiment,
      severity,
      tags: tags.slice(0, 5),
      opportunity_score,
      category,
      reasoning: `Local analysis: ${sentiment} ${category} issue detected with ${grossKeywords.filter(kw => lower.includes(kw)).length + noWayKeywords.filter(kw => lower.includes(kw)).length} keyword matches`
    };
    
    console.log('🎯 Local analysis result:', result);
    return result;
  }
}

// Updated factory with better error handling
export function createAIProvider(): AIProvider {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  console.log('🔍 Provider selection:', {
    hasGemini: !!geminiKey,
    hasOpenAI: !!openaiKey,
    hasAnthropic: !!anthropicKey
  });
  
  if (geminiKey) {
    console.log('🤖 Using Google Gemini provider');
    return new GeminiProvider(geminiKey);
  } else if (openaiKey) {
    console.log('🤖 Using OpenAI provider');
    // Add your OpenAI provider here if needed
  } else if (anthropicKey) {
    console.log('🤖 Using Anthropic provider');
    // Add your Anthropic provider here if needed
  }
  
  console.log('🏠 Using local fallback provider');
  return new LocalProvider();
}

// Enhanced main analysis function with detailed logging
export async function analyzeIck(content: string): Promise<IckAnalysis> {
  console.log('🎯 Starting ick analysis for:', content.substring(0, 100) + '...');
  
  const provider = createAIProvider();
  
  try {
    const result = await provider.analyze(content);
    console.log('✅ Analysis completed successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ AI analysis failed, falling back to local analysis:', error);
    const fallback = new LocalProvider();
    const fallbackResult = await fallback.analyze(content);
    console.log('🏠 Fallback analysis completed:', fallbackResult);
    return fallbackResult;
  }
}