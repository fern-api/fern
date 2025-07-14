package example

import (
    client "github.com/chat/fern/client"
    option "github.com/chat/fern/option"
    context "context"
    v1 "github.com/chat/fern/v1"
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
    client.V1.Chat(
        context.TODO(),
        &v1.ChatRequest{
            Message: "message",
            Model: fern.String(
                "model",
            ),
            Stream: fern.Bool(
                true,
            ),
            Preamble: fern.String(
                "preamble",
            ),
            ChatHistory: []any{
                map[string]any{
                    "key": "value",
                },
                map[string]any{
                    "key": "value",
                },
            },
            ConversationId: fern.String(
                "conversation_id",
            ),
            PromptTruncation: v1.ChatRequestPromptTruncationOff.Ptr(),
            ForceSingleStep: fern.Bool(
                true,
            ),
            SafetyMode: v1.ChatRequestSafetyModeContextual.Ptr(),
        },
    )
}
