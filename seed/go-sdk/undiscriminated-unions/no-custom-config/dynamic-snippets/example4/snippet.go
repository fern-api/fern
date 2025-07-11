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
    client.Union.Call(
        context.TODO(),
        &undiscriminated.Request{
            Union: &undiscriminated.MetadataUnion{
                OptionalMetadata: map[string]any{
                    "union": map[string]any{
                        "key": "value",
                    },
                },
            },
        },
    )
}
