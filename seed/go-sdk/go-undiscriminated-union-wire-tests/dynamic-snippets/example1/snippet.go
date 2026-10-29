package example

import (
    context "context"

    fern "github.com/go-undiscriminated-union-wire-tests/fern"
    client "github.com/go-undiscriminated-union-wire-tests/fern/client"
    option "github.com/go-undiscriminated-union-wire-tests/fern/option"
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
    request := &fern.RerankRequest{
        Documents: []*fern.DocumentItem{
            &fern.DocumentItem{
                String: "documents",
            },
            &fern.DocumentItem{
                String: "documents",
            },
        },
        Query: "query",
    }
    _, err := client.Service.Rerank(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
