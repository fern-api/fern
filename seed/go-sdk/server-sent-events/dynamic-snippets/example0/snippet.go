package example

import (
    client "github.com/server-sent-events/fern/client"
    option "github.com/server-sent-events/fern/option"
    context "context"
    fern "github.com/server-sent-events/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Completions.Stream(
        context.TODO(),
        &fern.StreamCompletionRequest{
            Query: "query",
        },
    )
}
