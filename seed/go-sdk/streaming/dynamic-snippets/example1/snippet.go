package example

import (
    context "context"

    stream "github.com/fern-api/stream-go/v2"
    client "github.com/fern-api/stream-go/v2/client"
    option "github.com/fern-api/stream-go/v2/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &stream.Generateequest{
        NumEvents: 5,
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
