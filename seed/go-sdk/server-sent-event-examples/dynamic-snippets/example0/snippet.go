package example

import (
    client "github.com/server-sent-event-examples/fern/client"
    option "github.com/server-sent-event-examples/fern/option"
    context "context"
    fern "github.com/server-sent-event-examples/fern"
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
            Query: "foo",
        },
    )
}
