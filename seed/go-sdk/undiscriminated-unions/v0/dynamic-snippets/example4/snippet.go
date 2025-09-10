package example

import (
    client "github.com/undiscriminated-unions/fern/client"
    option "github.com/undiscriminated-unions/fern/option"
    context "context"
    fern "github.com/undiscriminated-unions/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Union.Call(
        context.TODO(),
        &fern.Request{
            Union: &fern.MetadataUnion{
                OptionalMetadata: map[string]any{
                    "union": map[string]any{
                        "key": "value",
                    },
                },
            },
        },
    )
}
