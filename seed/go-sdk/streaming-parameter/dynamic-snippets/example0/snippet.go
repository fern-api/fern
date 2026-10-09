package example

import (
    context "context"

    fern "github.com/streaming-parameter/fern"
    client "github.com/streaming-parameter/fern/client"
    option "github.com/streaming-parameter/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GenerateRequest{
        Stream: false,
        NumEvents: 5,
    }
    client.Dummy.Generate(
        context.TODO(),
        request,
    )
}
