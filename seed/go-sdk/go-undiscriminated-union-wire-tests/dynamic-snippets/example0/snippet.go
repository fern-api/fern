package example

import (
    client "github.com/go-undiscriminated-union-wire-tests/fern/client"
    option "github.com/go-undiscriminated-union-wire-tests/fern/option"
    fern "github.com/go-undiscriminated-union-wire-tests/fern"
    context "context"
)

func do() {
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
            &fern.DocumentItem{},
            &fern.DocumentItem{},
        },
        Query: "What is the capital of the United States?",
    }
    client.Service.Rerank(
        context.TODO(),
        request,
    )
}
