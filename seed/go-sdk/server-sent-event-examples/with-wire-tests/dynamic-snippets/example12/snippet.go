package example

import (
    context "context"

    sse "github.com/fern-api/sse-examples-go"
    client "github.com/fern-api/sse-examples-go/client"
    option "github.com/fern-api/sse-examples-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &sse.StreamEventsContextProtocolRequest{
        Query: "",
    }
    _, err := client.Completions.StreamEventsContextProtocol(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
