// src/lib/ai-analysis.ts

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
  
  // OpenAI Provider
  export class OpenAIProvider implements AIProvider {
    private apiKey: string;
    private model: string;
  
    constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
      this.apiKey = apiKey;
      this.model = model;
    }
  
    async analyze(content: string): Promise<IckAnalysis> {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: `Analyze this ick: "${content}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 400,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
  
      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No AI response received');
      }
  
      return this.parseResponse(aiResponse);
    }
  
    private getSystemPrompt(): string {
      return `You are an expert at analyzing user frustrations ("icks") for market research and business opportunities. 
  
  Analyze each ick and respond with ONLY a valid JSON object:
  
  {
    "sentiment": "gross" | "no way" | "acceptable",
    "severity": number (1-10),
    "tags": string[] (2-5 relevant tags),
    "opportunity_score": number (1-10),
    "category": string,
    "reasoning": string (brief explanation)
  }
  
  SENTIMENT GUIDE:
  - "gross": Physically disgusting, repulsive things (bad smells, hygiene, bodily functions)
  - "no way": Deal-breakers, completely unacceptable behaviors (rudeness, disrespect, major red flags)  
  - "acceptable": Annoying but tolerable minor frustrations (small delays, minor inconveniences)
  
  SEVERITY (1-10): How much this bothers people
  - 1-3: Minor annoyance
  - 4-6: Moderate frustration  
  - 7-8: Major problem
  - 9-10: Severe, widespread issue
  
  OPPORTUNITY_SCORE (1-10): Business/solution potential
  - 1-3: Low market potential
  - 4-6: Moderate opportunity
  - 7-8: Strong business potential
  - 9-10: Massive market opportunity
  
  CATEGORIES: tech, social, work, lifestyle, health, finance, transport, food, dating, family, education, shopping, entertainment, etc.
  
  TAGS: Specific, actionable keywords (max 5, min 2)
  
  Consider both emotional impact and market size. Be concise but insightful.`;
    }
  
    private parseResponse(response: string): IckAnalysis {
      try {
        const parsed = JSON.parse(response.trim());
        
        return {
          sentiment: this.validateSentiment(parsed.sentiment),
          severity: this.clampNumber(parsed.severity, 1, 10),
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ['general'],
          opportunity_score: this.clampNumber(parsed.opportunity_score, 1, 10),
          category: parsed.category || 'general',
          reasoning: parsed.reasoning || 'AI analysis completed'
        };
      } catch (error) {
        console.error('Failed to parse AI response:', response);
        throw new Error('Invalid AI response format');
      }
    }
  
    private validateSentiment(sentiment: any): 'gross' | 'no way' | 'acceptable' {
      if (['gross', 'no way', 'acceptable'].includes(sentiment)) {
        return sentiment;
      }
      return 'acceptable'; // default fallback
    }
  
    private clampNumber(value: any, min: number, max: number): number {
      const num = typeof value === 'number' ? value : parseInt(value) || min;
      return Math.max(min, Math.min(max, num));
    }
  }
  
  // Google Gemini Provider (Free!)
  export class GeminiProvider implements AIProvider {
    private apiKey: string;
    private model: string;
  
    constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
      this.apiKey = apiKey;
      this.model = model;
    }
  
    async analyze(content: string): Promise<IckAnalysis> {
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
            temperature: 0.3,
            maxOutputTokens: 400,
          },
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No AI response received from Gemini');
      }
  
      return this.parseResponse(aiResponse);
    }
  
    private getSystemPrompt(): string {
      return `You are an expert at analyzing user frustrations ("icks") for market research and business opportunities. 
  
  Analyze each ick and respond with ONLY a valid JSON object in this exact format:
  
  {
    "sentiment": "gross" | "no way" | "acceptable",
    "severity": number (1-10),
    "tags": ["tag1", "tag2", "tag3"],
    "opportunity_score": number (1-10),
    "category": "category_name",
    "reasoning": "brief explanation"
  }
  
  SENTIMENT RULES:
  - "gross": Physically disgusting, repulsive things (bad smells, hygiene, bodily functions, unsanitary conditions)
  - "no way": Deal-breakers, completely unacceptable behaviors (rudeness, disrespect, major red flags, betrayal)  
  - "acceptable": Annoying but tolerable minor frustrations (small delays, minor inconveniences, pet peeves)
  
  SEVERITY SCALE (1-10):
  - 1-3: Minor annoyance, barely bothers people
  - 4-6: Moderate frustration, noticeable issue
  - 7-8: Major problem, significantly bothers people
  - 9-10: Severe, widespread issue that really upsets people
  
  OPPORTUNITY_SCORE (1-10):
  - 1-3: Low market potential, hard to solve or monetize
  - 4-6: Moderate opportunity, possible solutions exist
  - 7-8: Strong business potential, clear market need
  - 9-10: Massive market opportunity, huge demand for solutions
  
  CATEGORY OPTIONS: tech, social, work, lifestyle, health, finance, transport, food, dating, family, education, shopping, entertainment, home, beauty, fitness, travel, environment
  
  TAGS: 2-4 specific, actionable keywords that describe the problem
  
  Be precise and consider both how much this frustrates people AND the business opportunity potential. Respond with ONLY the JSON object, no other text.`;
    }
  
    private parseResponse(response: string): IckAnalysis {
      try {
        // Extract JSON from the response (Gemini sometimes adds extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        const parsed = JSON.parse(jsonStr);
        
        return {
          sentiment: this.validateSentiment(parsed.sentiment),
          severity: this.clampNumber(parsed.severity, 1, 10),
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ['general'],
          opportunity_score: this.clampNumber(parsed.opportunity_score, 1, 10),
          category: parsed.category || 'general',
          reasoning: parsed.reasoning || 'AI analysis completed'
        };
      } catch (error) {
        console.error('Failed to parse Gemini response:', response);
        throw new Error('Invalid AI response format from Gemini');
      }
    }
  
    private validateSentiment(sentiment: any): 'gross' | 'no way' | 'acceptable' {
      if (['gross', 'no way', 'acceptable'].includes(sentiment)) {
        return sentiment;
      }
      return 'acceptable'; // default fallback
    }
  
    private clampNumber(value: any, min: number, max: number): number {
      const num = typeof value === 'number' ? value : parseInt(value) || min;
      return Math.max(min, Math.min(max, num));
    }
  }
  
  // Anthropic Claude Provider (if you prefer)
  export class AnthropicProvider implements AIProvider {
    private apiKey: string;
    private model: string;
  
    constructor(apiKey: string, model: string = 'claude-3-haiku-20240307') {
      this.apiKey = apiKey;
      this.model = model;
    }
  
    async analyze(content: string): Promise<IckAnalysis> {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 400,
          messages: [
            {
              role: 'user',
              content: `${this.getSystemPrompt()}\n\nAnalyze this ick: "${content}"`
            }
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }
  
      const data = await response.json();
      const aiResponse = data.content[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No AI response received');
      }
  
      return this.parseResponse(aiResponse);
    }
  
    private getSystemPrompt(): string {
      return `Analyze user frustrations ("icks") and respond with ONLY valid JSON:
  
  {
    "sentiment": "gross" | "no way" | "acceptable",
    "severity": number (1-10),
    "tags": string[] (2-5 tags),
    "opportunity_score": number (1-10),
    "category": string,
    "reasoning": string
  }
  
  Sentiment: "gross" = disgusting/repulsive, "no way" = unacceptable/deal-breaker, "acceptable" = annoying but tolerable
  Severity: 1-10 how much this bothers people
  Opportunity: 1-10 business potential
  Category: tech, social, work, lifestyle, health, etc.`;
    }
  
    private parseResponse(response: string): IckAnalysis {
      // Similar parsing logic as OpenAI
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        const parsed = JSON.parse(jsonStr);
        
        return {
          sentiment: this.validateSentiment(parsed.sentiment),
          severity: this.clampNumber(parsed.severity, 1, 10),
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ['general'],
          opportunity_score: this.clampNumber(parsed.opportunity_score, 1, 10),
          category: parsed.category || 'general',
          reasoning: parsed.reasoning || 'AI analysis completed'
        };
      } catch (error) {
        throw new Error('Invalid AI response format');
      }
    }
  
    private validateSentiment(sentiment: any): 'gross' | 'no way' | 'acceptable' {
      return ['gross', 'no way', 'acceptable'].includes(sentiment) ? sentiment : 'acceptable';
    }
  
    private clampNumber(value: any, min: number, max: number): number {
      const num = typeof value === 'number' ? value : parseInt(value) || min;
      return Math.max(min, Math.min(max, num));
    }
  }
  
  // Fallback Local Analysis (basic keyword-based)
  export class LocalProvider implements AIProvider {
    async analyze(content: string): Promise<IckAnalysis> {
      const lower = content.toLowerCase();
      
      // Simple keyword-based analysis
      const grossKeywords = ['smell', 'stink', 'gross', 'disgusting', 'vomit', 'puke', 'nasty', 'filthy'];
      const noWayKeywords = ['rude', 'disrespect', 'cheat', 'lie', 'steal', 'abuse', 'hate', 'never'];
      const techKeywords = ['app', 'website', 'phone', 'computer', 'software', 'bug', 'crash'];
      const workKeywords = ['boss', 'coworker', 'meeting', 'work', 'job', 'office', 'colleague'];
      
      let sentiment: 'gross' | 'no way' | 'acceptable' = 'acceptable';
      let category = 'general';
      let severity = 5;
      let opportunity_score = 5;
      
      // Determine sentiment
      if (grossKeywords.some(kw => lower.includes(kw))) {
        sentiment = 'gross';
        severity += 2;
      } else if (noWayKeywords.some(kw => lower.includes(kw))) {
        sentiment = 'no way';
        severity += 3;
        opportunity_score += 2;
      }
      
      // Determine category
      if (techKeywords.some(kw => lower.includes(kw))) {
        category = 'tech';
        opportunity_score += 2;
      } else if (workKeywords.some(kw => lower.includes(kw))) {
        category = 'work';
        opportunity_score += 1;
      }
      
      // Clamp values
      severity = Math.max(1, Math.min(10, severity));
      opportunity_score = Math.max(1, Math.min(10, opportunity_score));
      
      return {
        sentiment,
        severity,
        tags: [category, sentiment],
        opportunity_score,
        category,
        reasoning: `Basic analysis: ${sentiment} ${category} issue with severity ${severity}/10`
      };
    }
  }
  
  // Factory function to get the right provider
  export function createAIProvider(): AIProvider {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (geminiKey) {
      console.log('🤖 Using Google Gemini provider (Free!)');
      return new GeminiProvider(geminiKey);
    } else if (openaiKey) {
      console.log('🤖 Using OpenAI provider');
      return new OpenAIProvider(openaiKey);
    } else if (anthropicKey) {
      console.log('🤖 Using Anthropic provider');
      return new AnthropicProvider(anthropicKey);
    } else {
      console.log('🤖 Using local fallback provider');
      return new LocalProvider();
    }
  }
  
  // Main analysis function
  export async function analyzeIck(content: string): Promise<IckAnalysis> {
    const provider = createAIProvider();
    
    try {
      return await provider.analyze(content);
    } catch (error) {
      console.error('AI analysis failed, falling back to local analysis:', error);
      const fallback = new LocalProvider();
      return await fallback.analyze(content);
    }
  }