// api/generate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  try {
    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024x1024/text-to-image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`, // 🔑 env var
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          clip_guidance_preset: "FAST_BLUE",
          height: 1024,      // ✅ image height
          width: 1024,       // ✅ image width
          samples: 1
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();

    // Stability returns base64 image(s) inside `artifacts`
    const imageBase64 = data.artifacts?.[0]?.base64;
    if (!imageBase64) {
      return res.status(500).json({ error: 'No image returned from Stability API' });
    }

    res.status(200).json({ image: imageBase64 });
  } catch (error) {
    res.status(500).json({ error: 'Image generation failed', details: error.message });
  }
}
