package example

import (
    client "github.com/chat/fern/client"
    option "github.com/chat/fern/option"
    context "context"
    v2 "github.com/chat/fern/v2"
    fern "github.com/chat/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.V2.V2.Chat(
        context.TODO(),
        &v2.V2ChatRequest{
            Model: "model",
            Documents: []string{
                "documents",
                "documents",
            },
            SafetyMode: v2.V2ChatRequestSafetyModeContextual.Ptr(),
            MaxTokens: fern.Int(
                1,
            ),
            StopSequences: []string{
                "stop_sequences",
                "stop_sequences",
            },
            Temperature: fern.Float64(
                1.1,
            ),
            ReturnPrompt: fern.Bool(
                true,
            ),
        },
    )
}
