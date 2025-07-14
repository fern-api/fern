package example

import (
    client "github.com/chat/fern/client"
    option "github.com/chat/fern/option"
    context "context"
    v1 "github.com/chat/fern/v1"
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
        },
    )
}
