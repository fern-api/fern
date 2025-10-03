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
    request := &undiscriminatedgo.MyUnion{
        String: "string",
    }
    client.Union.Get(
        context.TODO(),
        request,
    )
}
