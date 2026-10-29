package example

import (
    context "context"

    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
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
    _, err := client.Health.Service.Ping(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
