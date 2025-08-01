// Privacy Policy Analyzer - Gemini Analyzer Module
// AI-powered analysis using Google Gemini API

import { Utils } from './utils.js';

export class GeminiAnalyzer {
    static async analyze(textContent, settings) {
        try {
            if (!settings?.apiKey) {
                throw new Error('No API key provided in settings');
            }

            const prompt = `You are a privacy law expert. Analyze the following privacy policy text and identify potential privacy concerns. 

Return a JSON response with this exact structure (ensure valid JSON format):

{
  "issues": [
    {
      "id": "unique_id",
      "severity": "high|medium|low",
      "category": "Data Sharing|Data Retention|Tracking|Security|User Rights|Policy Changes",
      "title": "Brief title",
      "description": "What the issue is",
      "legalSuggestion": "What users should know or do",
      "matchedText": "The relevant text from the policy",
      "context": "Surrounding context"
    }
  ],
  "summary": "Brief summary of the analysis",
  "recommendations": ["List of recommendations for users"]
}

Focus on identifying:
- Data sharing with third parties
- Indefinite data retention
- Extensive tracking and monitoring
- Vague security measures
- Limited user rights
- Unilateral policy changes

Privacy policy text to analyze:
${textContent.substring(0, 8000)}`; // Limit text to avoid API limits

            const model = settings.analysisDepth === 'detailed' ? 'gemini-2.0-flash' : 'gemini-2.0-flash';
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

            const requestBody = {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            };

            let lastError = null;
            const maxRetries = 2;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-goog-api-key': settings.apiKey
                        },
                        body: JSON.stringify(requestBody)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('API error response:', errorText);

                        // Check if it's a retryable error (5xx server errors)
                        if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                            lastError = new Error(`Gemini API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
                            continue;
                        } else {
                            throw new Error(`Gemini API error: ${response.status} ${response.statusText}. Details: ${errorText}`);
                        }
                    }

                    // Success - process the response
                    const data = await response.json();

                    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                        console.error('Invalid response structure:', data);
                        throw new Error('Invalid response from Gemini API');
                    }

                    const responseText = data.candidates[0].content.parts[0].text;

                    // Parse JSON with recovery logic
                    const analysis = this.parseGeminiResponse(responseText, textContent);

                    return analysis;

                } catch (error) {
                    lastError = error;
                    if (attempt < maxRetries && (error.message.includes('fetch') || error.message.includes('network'))) {
                        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                        continue;
                    } else {
                        break;
                    }
                }
            }

            // If we get here, all retries failed
            throw lastError;

        } catch (error) {
            console.error('=== GEMINI ANALYSIS FAILED ===');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    static parseGeminiResponse(responseText, textContent) {
        // Try to extract and fix JSON from the response
        let jsonText = responseText;

        // Remove markdown code blocks if present
        jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

        // Extract JSON object
        let jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in response text:', responseText);
            throw new Error('No valid JSON found in Gemini response');
        }

        let jsonString = jsonMatch[0];

        // Try to parse JSON with recovery logic
        try {
            // First attempt: direct parsing
            const analysis = JSON.parse(jsonString);
            return this.processAnalysis(analysis, textContent);
        } catch (parseError) {

            // Try recovery if it's a truncated array
            if (parseError.message.includes('Expected') && parseError.message.includes('after array element')) {
                const recoveredAnalysis = this.recoverTruncatedJson(jsonString);
                if (recoveredAnalysis) {
                    return this.processAnalysis(recoveredAnalysis, textContent);
                }
            }

            throw parseError;
        }
    }

    static recoverTruncatedJson(jsonString) {
        const issuesStart = jsonString.indexOf('"issues": [');
        if (issuesStart === -1) return null;

        const issuesArray = [];
        let currentPos = issuesStart + 11;
        let braceCount = 0;
        let inString = false;
        let escape = false;
        let currentObject = '';

        for (let i = currentPos; i < jsonString.length; i++) {
            const char = jsonString[i];

            if (escape) {
                escape = false;
                currentObject += char;
                continue;
            }

            if (char === '\\') {
                escape = true;
                currentObject += char;
                continue;
            }

            if (char === '"' && !escape) {
                inString = !inString;
            }

            if (!inString) {
                if (char === '{') {
                    if (braceCount === 0) {
                        currentObject = char;
                    } else {
                        currentObject += char;
                    }
                    braceCount++;
                } else if (char === '}') {
                    currentObject += char;
                    braceCount--;
                    if (braceCount === 0) {
                        try {
                            const testObj = JSON.parse(currentObject);
                            issuesArray.push(testObj);
                            currentObject = '';
                        } catch (objError) {
                            // Skip malformed object
                        }
                    }
                } else if (char === ']' && braceCount === 0) {
                    break;
                } else {
                    if (braceCount > 0) {
                        currentObject += char;
                    }
                }
            } else {
                if (braceCount > 0) {
                    currentObject += char;
                }
            }
        }

        if (issuesArray.length > 0) {
            return {
                issues: issuesArray,
                summary: `Recovered analysis from Gemini API. Found ${issuesArray.length} privacy concerns.`,
                recommendations: [
                    'Review the highlighted privacy concerns carefully',
                    'Consider the privacy implications before using this service',
                    'Contact the service provider for clarification on unclear policies'
                ]
            };
        }

        return null;
    }

    static processAnalysis(analysis, textContent) {
        // Validate the response structure
        if (!analysis.issues || !Array.isArray(analysis.issues)) {
            console.error('Invalid analysis structure:', analysis);
            throw new Error('Invalid analysis structure from Gemini');
        }

        // Add position information to issues
        analysis.issues.forEach((issue, index) => {
            if (issue.matchedText) {
                const position = textContent.toLowerCase().indexOf(issue.matchedText.toLowerCase());
                issue.position = position >= 0 ? position : 0;
            }
            if (!issue.context && issue.matchedText) {
                issue.context = Utils.extractContext(textContent, issue.position || 0, issue.matchedText.length);
            }
        });

        return analysis;
    }
}
