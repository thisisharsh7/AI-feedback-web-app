export async function getCodeFeedback(code, challenge) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'smollm2:135m',
                prompt: `You are a senior frontend developer with expertise in React and UI/UX. Review the provided React code and provide concise, actionable feedback (3–5 points max) based on this challenge: "${challenge}". Focus on code quality, performance, accessibility, and React best practices. Avoid repetition and provide specific improvements. Code:\n${code}`,
                stream: false,
                options: {
                    temperature: 0.5, // Reduce randomness
                    max_tokens: 200, // Limit to ~100–150 words
                    top_p: 0.9, // Improve coherence
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.response) {
            throw new Error('No response field in Ollama API output');
        }

        return data.response.trim(); // Trim to remove any extra whitespace
    } catch (error) {
        console.error('Error fetching feedback from Ollama:', error);
        throw new Error(`Failed to fetch feedback: ${error.message}`);
    }
}