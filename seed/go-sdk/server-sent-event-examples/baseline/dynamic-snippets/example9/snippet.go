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
    request := &sse.StreamEventsDiscriminantInDataRequest{
        Query: "query",
    }
    client.Completions.StreamEventsDiscriminantInData(
        context.TODO(),
        request,
    )
}
