package example

import (
    client "github.com/literal/fern/client"
    context "context"
    fern "github.com/literal/fern"
)

func do() () {
    client := client.NewClient()
    client.Headers.Send(
        context.TODO(),
        &fern.SendLiteralsInHeadersRequest{
            Query: "What is the weather today",
        },
    )
}
