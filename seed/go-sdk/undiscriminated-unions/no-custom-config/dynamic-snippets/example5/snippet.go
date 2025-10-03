package example

import (
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
    undiscriminatedgo "github.com/fern-api/undiscriminated-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &undiscriminatedgo.Request{
        Union: &undiscriminatedgo.MetadataUnion{
            OptionalMetadata: map[string]any{
                "string": map[string]any{
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
