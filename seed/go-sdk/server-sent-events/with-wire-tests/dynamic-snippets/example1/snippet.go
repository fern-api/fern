package example

import (
    context "context"

    sse "github.com/fern-api/sse-go"
    client "github.com/fern-api/sse-go/client"
    option "github.com/fern-api/sse-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &sse.StreamCompletionRequest{
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
