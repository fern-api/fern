package example

import (
    context "context"

    sseresumable "github.com/fern-api/sse-resumable-go"
    client "github.com/fern-api/sse-resumable-go/client"
    option "github.com/fern-api/sse-resumable-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &sseresumable.StreamCompletionRequestNonResumable{
        Query: "bar",
    }
    client.Completions.StreamNonResumable(
        context.TODO(),
        request,
    )
}
