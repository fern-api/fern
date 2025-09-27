package example

import (
    client "github.com/server-sent-events/fern/client"
    option "github.com/server-sent-events/fern/option"
    fern "github.com/server-sent-events/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.StreamCompletionRequest{
        Query: "query",
    }
    client.Completions.Stream(
        context.TODO(),
        request,
    )
}
