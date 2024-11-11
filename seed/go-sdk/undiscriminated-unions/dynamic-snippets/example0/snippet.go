package example

import (
    client "github.com/fern-api/undiscriminated-go/client"
    context "context"
    undiscriminated "github.com/fern-api/undiscriminated-go"
)

func do() () {
    client := client.NewClient()
    client.Union.Get(
        context.TODO(),
        &undiscriminated.MyUnion{
            String: "string",
        },
    )
}
