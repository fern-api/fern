package example

import (
    context "context"
    sse "github.com/fern-api/sse-go"
    client "github.com/fern-api/sse-go/client"
    option "github.com/fern-api/sse-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &sse.StreamCompletionRequestWithoutTerminator{
        Query: "query",
    }
    client.Completions.StreamWithoutTerminator(
        context.TODO(),
        request,
    )
}
