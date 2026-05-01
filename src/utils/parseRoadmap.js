export const parseRoadmap = async (text) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please set VITE_GEMINI_API_KEY.");
  }

  const systemPrompt = `Parse the given learning roadmap text into structured JSON.
Return ONLY raw JSON — no markdown fences, no explanation.
Schema:
{
  "title": "roadmap name",
  "sections": [
    {
      "id": "s1",
      "title": "Phase or Section title",
      "subsections": [
        {
          "id": "s1-1",
          "title": "1.2 Control Flow & Loops (Weeks 2-3)",
          "groups": [
            {
              "id": "s1-1-g1",
              "label": "Topics",
              "items": [
                { "id": "s1-1-g1-i1", "label": "If/else statements" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
Rules: all IDs must be unique and sequential. Group labels must match what's in the text (Topics, Subtopics, Learning Activities, Mini Projects, etc). Keep item labels concise.

Parse this roadmap:\n\n${text}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4000 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const raw = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();

    return JSON.parse(raw);
  } catch (error) {
    console.error("Parse Roadmap Error:", error);
    throw new Error("Failed to parse roadmap: " + error.message);
  }
};
