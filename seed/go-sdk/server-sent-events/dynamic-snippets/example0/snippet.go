package example

import (
    client "github.com/server-sent-events/fern/client"
    context "context"
    fern "github.com/server-sent-events/fern"
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
