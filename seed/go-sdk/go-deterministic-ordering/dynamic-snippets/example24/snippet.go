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
    _, err := client.Endpoints.HTTPMethods.TestDelete(
        context.TODO(),
        "id",
    )
    if err != nil {
        return err
    }
    return nil
}
