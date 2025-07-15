package example

import (
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
    context "context"
    undiscriminated "github.com/fern-api/undiscriminated-go"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Union.DuplicateTypesUnion(
        context.TODO(),
        &undiscriminated.UnionWithDuplicateTypes{
            String: "string",
        },
    )
}
