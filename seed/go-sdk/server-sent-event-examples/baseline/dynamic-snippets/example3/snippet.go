package example

import (
    context "context"

    fern "github.com/server-sent-event-examples/fern"
    client "github.com/server-sent-event-examples/fern/client"
    option "github.com/server-sent-event-examples/fern/option"
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
