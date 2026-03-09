package example

import (
    client "github.com/fern-api/sse-examples-go/client"
    option "github.com/fern-api/sse-examples-go/option"
    sse "github.com/fern-api/sse-examples-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &sse.StreamEventsRequest{
        Query: "query",
    }
    client.Completions.StreamEvents(
        context.TODO(),
        request,
    )
}
