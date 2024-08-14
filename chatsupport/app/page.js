/* eslint-disable react/no-unescaped-entities */
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
import { useState, useEffect } from "react";
import { marked } from "marked";
import "@fontsource/bungee";

export default function Home() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Ask questions from two of our experts! ...
            Vivienne, the fashion queen,
            and Leo the Science and Math Tutor!`,
            label: "neither",
        },
    ]);
    const [message, setMessage] = useState("");
    const [modelParams, setModelParams] = useState(null);
    const [openAbout, setOpenAbout] = useState(false);
    const [openFeedback, setOpenFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [feedbackType, setFeedbackType] = useState(null);

    useEffect(() => {
        const fetchModelParams = async () => {
            try {
                const response = await fetch("/saved_naive_bayes_model.json");
                if (!response.ok) {
                    throw new Error("Failed to load model parameters");
                }
                const data = await response.json();
                console.log(data);
                setModelParams(data);
            } catch (error) {
                console.error("Error fetching model parameters:", error);
            }
        };
        fetchModelParams();
    }, []);

    function predict(prompt) {
        if (!modelParams) {
            console.error("Model parameters not loaded.");
            return null;
        }

        console.log(`Received prompt: "${prompt}"`);

        const tokens = prompt.split(/\s+/);
        console.log("Tokens:", tokens);

        const vector = new Array(
            Object.keys(modelParams.vocabulary_).length
        ).fill(0);
        console.log("Initial vector:", vector);

        tokens.forEach((token) => {
            const index = modelParams.vocabulary_[token];
            if (index !== undefined) {
                vector[index] += 1;
            }
        });

        console.log("Vector after processing tokens:", vector);

        const logProbs = modelParams.classes_.map((_, classIndex) => {
            const logProb =
                modelParams.class_log_prior_[classIndex] +
                vector.reduce((sum, value, i) => {
                    return (
                        sum +
                        value * modelParams.feature_log_prob_[classIndex][i]
                    );
                }, 0);
            console.log(
                `Log probability for class "${modelParams.classes_[classIndex]}": ${logProb}`
            );
            return logProb;
        });

        const maxIndex = logProbs.indexOf(Math.max(...logProbs));
        console.log("Predicted class index:", maxIndex);
        console.log("Predicted class:", modelParams.classes_[maxIndex]);

        return modelParams.classes_[maxIndex];
    }

    const sendMessage = async () => {
        if (!message.trim()) return;

        const userPrompt = message;
        const predictedLabel = predict(userPrompt); // Predict the category

        setMessages((messages) => [
            ...messages,
            { role: "user", content: message, label: predictedLabel },
        ]);

        let apiUrl = "";
        switch (predictedLabel) {
            case "fashion":
                apiUrl = "/api/fashion";
                break;
            case "studies":
                apiUrl = "/api/study";
                break;
            case "neither":
                setMessages((messages) => [
                    ...messages,
                    {
                        role: "assistant",
                        content:
                            "The prompt is unrelated. Please ask questions related to fashion or studies.",
                        label: "neither",
                    },
                ]);
                return;
            default:
                console.error("Unexpected label:", predictedLabel);
                setMessages((messages) => [
                    ...messages,
                    {
                        role: "assistant",
                        content:
                            "Sorry, I couldn't determine the category of your question.",
                        label: "neither",
                    },
                ]);
                return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: userPrompt }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let result = "";
            await reader.read().then(function processText({ done, value }) {
                if (done) {
                    return result;
                }
                const text = decoder.decode(value || new Uint8Array(), {
                    stream: true,
                });

                try {
                    const jsonResponse = JSON.parse(text);
                    if (jsonResponse.data) {
                        const markdownContent = marked(jsonResponse.data);
                        setMessages((messages) => [
                            ...messages,
                            {
                                role: "assistant",
                                content: markdownContent,
                                label: predictedLabel,
                            },
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

                return reader.read().then(processText);
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((messages) => [
                ...messages,
                {
                    role: "assistant",
                    content:
                        "There was an error processing your request. Please try again later.",
                    label: "neither",
                },
            ]);
        }

        setMessage("");
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
                    p: 1,
                    mt: 1,
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
                            fontSize: "2rem",
                        },
                    }}>
                    Welcome to Fab'N'Formula-AI!
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
                        height: {xs:"590px", sm:"560px"},
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
                                                ? message.label === "fashion"
                                                    ? "#fcccff"
                                                    : message.label ===
                                                      "studies"
                                                    ? "#ccffe6"
                                                    : "#dbdbdb"
                                                : "#2e7bff", 
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

                {/* Buttons Box */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        p: 2,
                        flexDirection: "column", // Stack buttons vertically
                        position: {
                            xs: "static", // Removes position on extra small screens and up to small screens
                            sm: "absolute", // Applies absolute positioning on small screens and larger
                        },
                        top: 0,
                        right: 0,
                    }}>
                    <Button
                        variant="contained"
                        sx={{
                            mb: 2, // Margin bottom to separate the buttons
                            bgcolor: "#2e7bff",
                            color: "#ffffff",
                            "&:hover": {
                                bgcolor: "#1c5bbf",
                            },
                        }}
                        onClick={() => setOpenAbout(true)}>
                        About
                    </Button>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: "#2e7bff",
                            color: "#ffffff",
                            "&:hover": {
                                bgcolor: "#1c5bbf",
                            },
                        }}
                        onClick={() => setOpenFeedback(true)}>
                        Feedback
                    </Button>
                </Box>

                {/* About Dialog */}
                <Dialog open={openAbout} onClose={() => setOpenAbout(false)}>
                    <DialogTitle>About</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            Welcome to FabNFormula-AI! This app allows you to
                            chat with our two experts: Vivienne, the fashion
                            queen, and Leo, the Science and Math Tutor! Ask away
                            and get the best advice tailored just for you.
                        </Typography>
                    </DialogContent>
                </Dialog>

                {/* Feedback Dialog */}
                <Dialog
                    open={openFeedback}
                    onClose={() => setOpenFeedback(false)}>
                    <DialogTitle>Give Feedback</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2}>
                            <Typography variant="body1">
                                How would you rate your experience?
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <IconButton
                                    color={
                                        feedbackType === "positive"
                                            ? "primary"
                                            : "default"
                                    }
                                    onClick={() => setFeedbackType("positive")}>
                                    <ThumbUp />
                                </IconButton>
                                <IconButton
                                    color={
                                        feedbackType === "negative"
                                            ? "primary"
                                            : "default"
                                    }
                                    onClick={() => setFeedbackType("negative")}>
                                    <ThumbDown />
                                </IconButton>
                            </Stack>
                            <TextField
                                label="Additional Feedback"
                                multiline
                                rows={4}
                                fullWidth
                                value={feedbackText}
                                onChange={(e) =>
                                    setFeedbackText(e.target.value)
                                }
                            />
                            <Button
                                variant="contained"
                                onClick={submitFeedback}>
                                Submit
                            </Button>
                        </Stack>
                    </DialogContent>
                </Dialog>
            </Box>
        </Box>
    );
}
