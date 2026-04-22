package example

import (
    context "context"

    fern "github.com/streaming/fern"
    client "github.com/streaming/fern/client"
    option "github.com/streaming/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GenerateStreamRequest{
        NumEvents: 1,
    }
    client.Dummy.GenerateStream(
        context.TODO(),
        request,
    )
}
