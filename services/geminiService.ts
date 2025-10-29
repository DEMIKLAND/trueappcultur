
import { GoogleGenAI } from "@google/genai";

export const generateAIDescription = async (title: string, type: string): Promise<string> => {
    // This check is important because process.env is not available in browser by default.
    // In a real deployed environment with a build tool, this would be properly configured.
    // For this demo, we mock the behavior if the key isn't set.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY environment variable not set. Returning mock data.");
        return `This is a mock AI-generated description for a ${type.toLowerCase()} titled "${title}". The actual Gemini API would provide a more detailed and context-aware summary here.`;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Generate a short, engaging description for a piece of content. The content is a ${type.toLowerCase()} titled "${title}". The description should be about 2 sentences long.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating content with Gemini API:", error);
        return "Error generating AI description. Please try again or write one manually.";
    }
};
