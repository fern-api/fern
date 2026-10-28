package example

import (
    context "context"

    fern "github.com/streaming-parameter/fern"
    client "github.com/streaming-parameter/fern/client"
    option "github.com/streaming-parameter/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GenerateRequest{
        Stream: true,
        NumEvents: 1,
    }
    _, err := client.Dummy.Generate(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
