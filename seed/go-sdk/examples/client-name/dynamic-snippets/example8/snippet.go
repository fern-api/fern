package example

import (
    context "context"

    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() error {
    client := client.NewAcme(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    err := client.Health.Service.Check(
        context.TODO(),
        "id-2sdx82h",
    )
    if err != nil {
        return err
    }
    return nil
}
