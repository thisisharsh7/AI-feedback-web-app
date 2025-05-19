import axios from 'axios';

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export async function getAIReview({ files, challenge, screenshotFile }) {
  const fileTexts = Object.entries(files).map(
    ([name, content]) => `--- ${name} ---\n${content}`
  ).join('\n\n');

  const prompt = `
You're an expert frontend reviewer. Here is the user's code:

${fileTexts}

They said their challenge was:
"${challenge}"

Give a helpful and constructive review including feedback on code, structure, accessibility, responsiveness, and visual design.
`;

  const messages = screenshotFile
    ? [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: await toBase64(screenshotFile),
              },
            },
          ],
        },
      ]
    : [{ role: 'user', content: prompt }];

  const model = screenshotFile ? 'gpt-4-vision-preview' : 'gpt-4';

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    },
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}
