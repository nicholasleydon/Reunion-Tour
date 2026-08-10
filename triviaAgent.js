// backend/triviaAgent.js (Updated prompt logic)

async function generateTrivia(title, artist) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: triviaSchema,
      }
    });

    // Upgraded prompt enforcing genuine music history & lore
    const prompt = `
      You are an expert music historian and rock critic for an underground music magazine. 
      Generate a compelling, genuinely interesting multiple-choice trivia question about the song "${title}" by ${artist}.
      
      RULES FOR THE QUESTION:
      - Focus on real music history: album context, release year, band lineup, recording studio lore, sample origins, or cultural impact.
      - ABSOLUTELY NO counting exercises (e.g., do not ask how many letters are in a word, how many words are in a title, or spelling/grammar checks).
      - Must have exactly 4 multiple-choice options, with only 1 correct answer.
      - Provide a fun, 1-sentence explanation of the backstory.
      
      Return the data strictly adhering to the JSON schema.
    `;
    
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Trivia Gen Failed:", error);
    return {
      question: `Which seminal album features the track "${title}" by ${artist}?`,
      options: ["Greatest Hits Vol. 1", "The Studio Sessions", "The Breakthrough Record", "Live from the Vault"],
      correctIndex: 2,
      explanation: "A classic release that defined their signature sound."
    };
  }
}