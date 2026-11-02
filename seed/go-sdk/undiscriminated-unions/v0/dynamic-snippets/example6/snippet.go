package example

import (
    context "context"

    fern "github.com/undiscriminated-unions/fern"
    client "github.com/undiscriminated-unions/fern/client"
    option "github.com/undiscriminated-unions/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.Request{
        Union: &fern.MetadataUnion{
            OptionalMetadata: map[string]any{
                "union": map[string]any{
                    "key": "value",
                },
            },
        },
    }
    _, err := client.Union.Call(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
