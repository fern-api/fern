package example

import (
    client "github.com/server-sent-event-examples/fern/client"
    context "context"
    fern "github.com/server-sent-event-examples/fern"
)

func do() () {
    client := client.NewClient()
    client.Completions.Stream(
        context.TODO(),
        &fern.StreamCompletionRequest{
            Query: "query",
        },
    )
}
