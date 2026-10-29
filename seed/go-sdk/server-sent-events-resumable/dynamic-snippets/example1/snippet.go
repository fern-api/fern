package example

import (
    context "context"

    sseresumable "github.com/fern-api/sse-resumable-go"
    client "github.com/fern-api/sse-resumable-go/client"
    option "github.com/fern-api/sse-resumable-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &sseresumable.StreamCompletionRequest{
        Query: "query",
    }
    _, err := client.Completions.Stream(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
