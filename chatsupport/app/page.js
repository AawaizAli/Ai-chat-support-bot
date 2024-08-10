"use client";

import { Box, Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { marked } from "marked";

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Ask away...",
        },
    ]);
    const [message, setMessage] = useState("");

    const sendMessage = async () => {
        if (!message.trim()) return; 

        const userPrompt = { prompt: message }; 

        setMessages((messages) => [
            ...messages,
            { role: "user", content: message }, // Add the user's message to the chat
        ]);

        setMessage(""); // Clear the input field

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userPrompt), // Send the JSON object with the user's message as "prompt"
            });

            const reader = response.body.getReader(); // Get a reader to read the response body
            const decoder = new TextDecoder(); // Create a decoder to decode the response text

            let result = "";
            // Function to process the text from the response
            await reader.read().then(function processText({ done, value }) {
                if (done) {
                    return result;
                }
                const text = decoder.decode(value || new Uint8Array(), {
                    stream: true,
                }); // Decode the text

                try {
                    const jsonResponse = JSON.parse(text); // Parse the JSON response
                    if (jsonResponse.data) {
                        const markdownContent = marked(jsonResponse.data); // Convert the markdown to HTML
                        setMessages((messages) => [
                            ...messages,
                            { role: "assistant", content: markdownContent }, // Append the converted HTML to the assistant's message
                        ]);
                    } else {
                        console.error(
                            "Error: 'data' field is missing in the response."
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error parsing JSON or converting markdown:",
                        error
                    );
                }

                return reader.read().then(processText); // Continue reading the next chunk of the response
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center">
            <Stack
                direction={"column"}
                width="350px"
                height="600px"
                border="1px solid black"
                borderRadius="10px"
                p={2}
                spacing={3}>
                <Stack
                    direction={"column"}
                    spacing={1}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%">
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent={
                                message.role === "assistant"
                                    ? "flex-start"
                                    : "flex-end"
                            }>
                            <Box
                                bgcolor={
                                    message.role === "assistant"
                                        ? "primary.main"
                                        : "secondary.main"
                                }
                                color={
                                    message.role === "assistant"
                                        ? "#000000"
                                        : "#ffffff"
                                }
                                borderRadius={12}
                                p={2}
                                dangerouslySetInnerHTML={{
                                    __html: message.content,
                                }} 
                            />
                        </Box>
                    ))}
                </Stack>
                <Stack direction={"row"} spacing={2}>
                    <TextField
                        label="Message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                        Send
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
}
