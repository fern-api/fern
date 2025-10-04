package example

import (
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
    undiscriminated "github.com/fern-api/undiscriminated-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &undiscriminated.Request{
        Union: &undiscriminated.MetadataUnion{
            OptionalMetadata: map[string]any{
                "union": map[string]any{
                    "key": "value",
                },
            },
        },
    }
    client.Union.Call(
        context.TODO(),
        request,
    )
}
