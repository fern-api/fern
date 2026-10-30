package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.PostWithArrayBodyAndHeaders{
        XCustomHeader: fern.String(
            "X-Custom-Header",
        ),
        Body: []string{
            "string",
            "string",
        },
    }
    _, err := client.InlinedRequests.PostWithArrayBodyAndHeaders(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
