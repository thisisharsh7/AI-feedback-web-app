export async function getCodeFeedback(code, question = '') {
    const apiToken = import.meta.env.VITE_HUGGINGFACE_TOKEN;
    const model = 'HuggingFaceH4/zephyr-7b-alpha';

    const prompt = `
You are a senior frontend developer. Here is some submitted code:

${code}

The developer said: "${question}"

Please provide feedback about structure, responsiveness, accessibility, or any improvements you suggest.
`;

    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
    });

    const result = await res.json();
    console.log('Hugging Face result:', result);

    if (res.status !== 200 || result.error) {
        throw new Error(result.error || 'API error');
    }

    return result.generated_text || result[0]?.generated_text || '⚠️ No output.';
}
