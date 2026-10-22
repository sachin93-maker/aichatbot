
exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" })
        };
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "GEMINI_API_KEY is missing in Netlify"
                })
            };
        }

        const { parts } = JSON.parse(event.body || "{}");

        if (!Array.isArray(parts) || parts.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Message is required" })
            };
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{ parts }]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);

            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: data.error?.message || "Gemini request failed"
                })
            };
        }

        const answer = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("");

        return {
            statusCode: 200,
            body: JSON.stringify({
                text: answer || "Sorry, I couldn't generate a response."
            })
        };

    } catch (error) {
        console.error("Chat function error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Something went wrong while generating the response."
            })
        };
    }
};
