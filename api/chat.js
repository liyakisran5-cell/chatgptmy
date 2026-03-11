export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { messages } = req.body;

    // Convert messages to Gemini format
    const geminiMessages = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyA84ST9c6b_EvJ8VCaVARvioN3kGY2rjTs",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `Tu BatAI hai — ek smart AI assistant jo Pakistan ke users ke liye bana gaya hai.
- Urdu aur English dono mein baat kar sakta hai
- Agar user Urdu/Roman Urdu mein likhe toh Roman Urdu mein jawab do
- Agar user English mein likhe toh English mein jawab do
- Friendly, helpful aur clear jawab do
- Har cheez ke baare mein baat kar sakta hai`
            }]
          },
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) throw new Error(JSON.stringify(data));

    return res.status(200).json({ reply });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
