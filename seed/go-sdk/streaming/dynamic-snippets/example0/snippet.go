package example

import (
    client "github.com/fern-api/stream-go/v2/client"
    option "github.com/fern-api/stream-go/v2/option"
    context "context"
    v2 "github.com/fern-api/stream-go/v2"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Dummy.GenerateStream(
        context.TODO(),
        &v2.GenerateStreamRequest{
            NumEvents: 1,
        },
    )
}
