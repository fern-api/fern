package example

import (
    client "github.com/fern-api/stream-go/v2/client"
    context "context"
    v2 "github.com/fern-api/stream-go/v2"
)

func do() () {
    client := client.NewClient()
    client.Dummy.GenerateStream(
        context.TODO(),
        &v2.GenerateStreamRequest{
            NumEvents: 1,
        },
    )
}
