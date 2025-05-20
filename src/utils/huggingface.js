export async function getCodeFeedback(code, question = '') {
    const apiToken = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiToken) {
        throw new Error("Missing OpenAI API key. Check your .env file and VITE_OPENAI_API_KEY.");
    }

    const prompt = `
You are a senior frontend developer. Review the following code:

${code}

The developer said: "${question}"

Please provide detailed feedback about structure, responsiveness, accessibility, performance, and any improvements you suggest.
`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 1000
        })
    });

    const result = await res.json();
    console.log('OpenAI result:', result);

    if (res.status !== 200 || result.error) {
        throw new Error(result.error?.message || 'API error');
    }

    return result.choices?.[0]?.message?.content || '⚠️ No output.';
}
