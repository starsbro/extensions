// API key testing functionality
export class ApiTester {
    static async testApiKey(apiKey, provider, sendResponse) {

        try {
            if (provider === 'gemini') {
                await this.testGeminiApiKey(apiKey, sendResponse);
            } else {
                sendResponse({ success: false, error: 'Unsupported provider' });
            }
        } catch (error) {
            console.error('API key test error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    static async testGeminiApiKey(apiKey, sendResponse) {
        // Try different models in order of preference (latest first)
        const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

        for (const model of models) {
            try {

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-goog-api-key': apiKey
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: "Hello, this is a test message."
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 50,
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

                    if (responseText) {
                        sendResponse({
                            success: true,
                            message: `API key is valid (using ${model})`,
                            model: model
                        });
                        return;
                    }
                } else {
                    const errorData = await response.json();

                    // If this is the last model, send the error
                    if (model === models[models.length - 1]) {
                        sendResponse({
                            success: false,
                            error: errorData.error?.message || 'Invalid API key'
                        });
                        return;
                    }
                }
            } catch (error) {

                // If this is the last model, send the error
                if (model === models[models.length - 1]) {
                    sendResponse({ success: false, error: error.message });
                    return;
                }
            }
        }
    }
}
