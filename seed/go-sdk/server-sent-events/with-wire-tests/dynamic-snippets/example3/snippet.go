package example

import (
    client "github.com/fern-api/sse-go/client"
    option "github.com/fern-api/sse-go/option"
    sse "github.com/fern-api/sse-go"
    context "context"
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
