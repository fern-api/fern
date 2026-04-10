package example

import (
    context "context"

    fern "github.com/server-sent-events-openapi/fern"
    client "github.com/server-sent-events-openapi/fern/client"
    option "github.com/server-sent-events-openapi/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SharedCompletionRequest{
        Prompt: "prompt",
        Model: "model",
        Stream: fern.Bool(
            true,
        ),
    }
    client.ValidateCompletion(
        context.TODO(),
        request,
    )
}
