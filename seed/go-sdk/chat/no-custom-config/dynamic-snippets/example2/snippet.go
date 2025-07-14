package example

import (
    client "github.com/chat/fern/client"
    option "github.com/chat/fern/option"
    context "context"
    v2 "github.com/chat/fern/v2"
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
        },
    )
}
