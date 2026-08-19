package example

import (
    context "context"

    sse "github.com/fern-api/sse-examples-go"
    client "github.com/fern-api/sse-examples-go/client"
    option "github.com/fern-api/sse-examples-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &sse.StreamEventsContextProtocolRequest{
        Query: "query",
    }
    client.Completions.StreamEventsContextProtocol(
        context.TODO(),
        request,
    )
}
