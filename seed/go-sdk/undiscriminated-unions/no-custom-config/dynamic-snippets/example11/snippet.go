package example

import (
    context "context"

    undiscriminated "github.com/fern-api/undiscriminated-go"
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &undiscriminated.UnionWithBaseProperties{
        NamedMetadata: &undiscriminated.NamedMetadata{
            Name: "name",
            Value: map[string]any{
                "value": map[string]any{
                    "key": "value",
                },
            },
        },
    }
    client.Union.GetWithBaseProperties(
        context.TODO(),
        request,
    )
}
