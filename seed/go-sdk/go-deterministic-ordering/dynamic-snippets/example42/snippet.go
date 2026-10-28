package example

import (
    context "context"

    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := "string"
    _, err := client.Endpoints.Params.ModifyWithPath(
        context.TODO(),
        "param",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
