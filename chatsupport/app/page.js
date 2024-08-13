"use client";

import {
    Box,
    Button,
    Stack,
    TextField,
    Typography,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import { ThumbUp, ThumbDown } from "@mui/icons-material";
import { useState } from "react";
import { marked } from "marked";
import "@fontsource/bungee";

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Ask questions from two of our experts! ...
            Vivienne, the fashion queen,
            and Leo the Science Tutor!`,
        },
    ]);
    const [message, setMessage] = useState("");
    const [openAbout, setOpenAbout] = useState(false);
    const [openFeedback, setOpenFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackType, setFeedbackType] = useState(null);

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userPrompt = { prompt: message };

        setMessages((messages) => [
            ...messages,
            { role: "user", content: message },
        ]);

        setMessage("");

        try {
            // Call the classify API to determine which LLM should respond
            const classifyResponse = await fetch("/api/classify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userPrompt),
            });

            if (!classifyResponse.ok) {
                // If the response is not OK, throw an error
                throw new Error(
                    `Server responded with ${classifyResponse.status}`
                );
            }

            const classifyData = await classifyResponse.json();
            const label = classifyData.label; // This should return 'fitness', 'fashion', or 'studies'

            // Reply with a placeholder message indicating which LLM would respond
            let responseMessage = `This would be handled by the ${label} expert.`;

            setMessages((messages) => [
                ...messages,
                { role: "assistant", content: responseMessage },
            ]);
        } catch (error) {
            console.error("Error classifying message:", error);
            setMessages((messages) => [
                ...messages,
                { role: "assistant", content: "Sorry, something went wrong." },
            ]);
        } finally {
            // Ensure any cleanup or final actions are taken here
            console.log("Finished handling the message.");
        }
    };

    const submitFeedback = () => {
        console.log("Feedback Type:", feedbackType);
        console.log("Feedback Text:", feedbackText);
        setOpenFeedback(false);
        setFeedbackType(null);
        setFeedbackText("");
    };

    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    p: 2,
                    position: "absolute",
                    top: 0,
                    right: 0,
                }}>
                <Button
                    variant="contained"
                    sx={{
                        ml: 2,
                        bgcolor: "#2e7bff",
                        color: "#ffffff",
                        "&:hover": {
                            bgcolor: "#1c5bbf", // Darker shade for hover
                        },
                    }}
                    onClick={() => setOpenAbout(true)}>
                    About
                </Button>

                <Button
                    variant="contained"
                    sx={{
                        ml: 2,
                        bgcolor: "#2e7bff",
                        color: "#ffffff",
                        "&:hover": {
                            bgcolor: "#1c5bbf", // Darker shade for hover
                        },
                    }}
                    onClick={() => setOpenFeedback(true)}>
                    Feedback
                </Button>
            </Box>

            <Box
                sx={{
                    p: 2,
                    mt: 6,
                    textAlign: "center",
                }}>
                <Typography
                    variant="h1"
                    sx={{
                        fontFamily: "Bungee, sans-serif",
                        color: "#2e7bff",
                        textShadow: "3px 3px 0px #283044",
                        fontSize: "3.5rem",
                        "@media (max-width: 600px)": {
                            fontSize: "2.5rem",
                        },
                    }}>
                    Welcome to Navi-AI!
                </Typography>
            </Box>

            {/* Main Chat Box */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    flexGrow: 1,
                    mt: 1,
                }}>
                <Stack
                    direction={"column"}
                    sx={{
                        width: "350px",
                        height: "600px",
                        border: "1px solid black",
                        borderRadius: "10px",
                        marginBottom: "30px",
                        p: 2,
                        spacing: "20px",
                    }}>
                    <Stack
                        direction={"column"}
                        sx={{
                            flexGrow: 1,
                            overflow: "auto",
                            maxHeight: "100%",
                            spacing: "20px",
                        }}>
                        {messages.map((message, index) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        message.role === "assistant"
                                            ? "flex-start"
                                            : "flex-end",
                                }}>
                                <Box
                                    sx={{
                                        bgcolor:
                                            message.role === "assistant"
                                                ? "primary.main"
                                                : "secondary.main",
                                        color:
                                            message.role === "assistant"
                                                ? "#000000"
                                                : "#ffffff",
                                        borderRadius: "16px",
                                        py: "7px",
                                        px: "16px",
                                        marginBottom: "10px",
                                    }}
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
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "#2e7bff",
                                color: "#ffffff",
                                "&:hover": {
                                    bgcolor: "#1c5bbf", // Darker shade for hover
                                },
                            }}
                            onClick={sendMessage}>
                            Send
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Dialog open={openAbout} onClose={() => setOpenAbout(false)}>
                <DialogTitle>About</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Welcome to our expert Q&A chatbot, where you can connect directly with two of our top specialists!
                    Vivienne, the Fashion Queen: Whether you're looking for the latest trends, styling tips, or fashion advice, Vivienne is here to help you stay ahead of the curve. Her expertise in the fashion world is unparalleled, and she's ready to answer all your style-related questions.
                    Leo, the Science Tutor: Need help with a tricky science concept? Leo is your go-to tutor for all things science. From biology to physics, he’s here to break down complex topics and make learning science fun and easy.
                    Ask away and get expert advice in fashion and science right at your fingertips!
                    </Typography>
                </DialogContent>
            </Dialog>

            <Dialog open={openFeedback} onClose={() => setOpenFeedback(false)}>
                <DialogTitle>Feedback</DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 2,
                        }}>
                        <IconButton
                            onClick={() => setFeedbackType("positive")}
                            color={
                                feedbackType === "positive"
                                    ? "primary"
                                    : "default"
                            }>
                            <ThumbUp />
                        </IconButton>
                        <IconButton
                            onClick={() => setFeedbackType("negative")}
                            color={
                                feedbackType === "negative"
                                    ? "primary"
                                    : "default"
                            }>
                            <ThumbDown />
                        </IconButton>
                    </Box>
                    <TextField
                        label="Your feedback"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        sx={{ mt: 2 }}
                        fullWidth
                        onClick={submitFeedback}
                        disabled={!feedbackType && !feedbackText.trim()}>
                        Submit Feedback
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
