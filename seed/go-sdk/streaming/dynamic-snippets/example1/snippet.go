package example

import (
    client "github.com/fern-api/stream-go/v2/client"
    option "github.com/fern-api/stream-go/v2/option"
    stream "github.com/fern-api/stream-go/v2"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &stream.Generateequest{
        NumEvents: 5,
    }
    client.Dummy.Generate(
        context.TODO(),
        request,
    )
}
