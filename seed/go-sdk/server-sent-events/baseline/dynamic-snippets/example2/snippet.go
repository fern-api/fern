package example

import (
    context "context"

    fern "github.com/server-sent-events/fern"
    client "github.com/server-sent-events/fern/client"
    option "github.com/server-sent-events/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.StreamCompletionRequestWithoutTerminator{
        Query: "query",
    }
    client.Completions.StreamWithoutTerminator(
        context.TODO(),
        request,
    )
}
