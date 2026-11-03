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
    request := 1
    _, err := client.Endpoints.Primitive.GetAndReturnInt(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
