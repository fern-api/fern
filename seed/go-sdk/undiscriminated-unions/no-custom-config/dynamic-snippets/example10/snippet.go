package example

import (
    context "context"

    undiscriminated "github.com/fern-api/undiscriminated-go"
    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &undiscriminated.AliasedObjectUnion{
        AliasedLeafA: &undiscriminated.LeafObjectA{
            OnlyInA: "onlyInA",
            SharedNumber: 1,
        },
    }
    _, err := client.Union.AliasedObjectUnion(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
