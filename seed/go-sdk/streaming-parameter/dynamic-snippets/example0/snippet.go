package example

import (
    client "github.com/streaming-parameter/fern/client"
    context "context"
    fern "github.com/streaming-parameter/fern"
)

func do() () {
    client := client.NewClient()
    client.Dummy.Generate(
        context.TODO(),
        &fern.GenerateRequest{
            Stream: false,
            NumEvents: 5,
        },
    )
}
