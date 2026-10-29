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
    request := &undiscriminated.MyUnion{
        String: "string",
    }
    _, err := client.Union.Get(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
