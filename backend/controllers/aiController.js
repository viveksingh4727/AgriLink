import OpenAI from "openai";

const getSambaClient = () => {
  if (!process.env.SAMBANOVA_API_KEY) {
    throw new Error("SAMBANOVA_API_KEY is not configured");
  }
  return new OpenAI({
    apiKey: process.env.SAMBANOVA_API_KEY,
    baseURL: process.env.SAMBANOVA_BASE_URL || "https://api.sambanova.ai/v1",
  });
};

// Best available SambaNova model
const SAMBA_MODEL = "Meta-Llama-3.3-70B-Instruct";

// ─── Price Suggestion ────────────────────────────────────────────────────────
export const suggestPrice = async (req, res) => {
  try {
    const client = getSambaClient();
    const { cropName, season, location, currentMonth } = req.body;

    const completion = await client.chat.completions.create({
      model: SAMBA_MODEL,
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            "You are an agricultural pricing expert for Indian markets. Give a practical price range in Indian rupees per kg and one concise reason. Keep the response under 80 words.",
        },
        {
          role: "user",
          content: `Crop: ${cropName}\nSeason: ${season}\nLocation: ${location}\nCurrent month: ${currentMonth}\n\nRespond in exactly two lines:\nPrice Range: ₹x–₹y/kg\nReason: ...`,
        },
      ],
    });

    const suggestion = completion.choices[0]?.message?.content?.trim() || "";
    return res.json({ suggestion });
  } catch (error) {
    console.error("SambaNova price error:", error.message);
    return res.status(500).json({ message: error.message || "Unable to get price suggestion" });
  }
};

// ─── Farmer Stress Support ───────────────────────────────────────────────────
export const getStressSupport = async (req, res) => {
  try {
    const client = getSambaClient();
    const { mood, note } = req.body;

    const completion = await client.chat.completions.create({
      model: SAMBA_MODEL,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content:
            "You are a compassionate mental wellness advisor for Indian farmers. Use warm, empathetic language. If the farmer is stressed, offer 2–3 practical coping tips specific to farming life. Keep your response under 120 words.",
        },
        {
          role: "user",
          content: `Mood: ${mood}\nAdditional note: ${note || "None"}`,
        },
      ],
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";
    return res.json({ response });
  } catch (error) {
    console.error("SambaNova stress error:", error.message);
    return res.status(500).json({ message: error.message || "Unable to get stress support" });
  }
};

// ─── General AI Chat Assistant ───────────────────────────────────────────────
export const chatAssistant = async (req, res) => {
  try {
    const client = getSambaClient();
    const { messages, userRole } = req.body; // messages = [{role, content}, ...]

    const systemPrompt = `You are AgriLink AI, a smart agricultural assistant built into the AgriLink marketplace platform for Indian farmers and buyers.

Your expertise covers:
- 🌾 Crop cultivation, diseases, and pest management
- 💰 Market prices, demand trends, and selling strategies  
- 🚜 Farming techniques — organic, drip irrigation, greenhouse
- 📦 Post-harvest handling, storage, and transportation
- 🌤️ Weather impact on crops and planning
- 🛒 Buying tips, quality checks, and negotiation for buyers
- 📱 How to use AgriLink platform features

${userRole === "farmer" ? "You are speaking to a FARMER. Focus on production, pricing, and selling." : ""}
${userRole === "buyer" ? "You are speaking to a BUYER. Focus on quality, sourcing, and market availability." : ""}

Keep responses friendly, practical, and concise (under 150 words). Use simple language suitable for Indian farmers and buyers. Format lists with bullet points when helpful.`;

    const completion = await client.chat.completions.create({
      model: SAMBA_MODEL,
      max_tokens: 400,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";
    return res.json({ response });
  } catch (error) {
    console.error("SambaNova chat error:", error.message);
    return res.status(500).json({ message: error.message || "Unable to get chat response" });
  }
};
