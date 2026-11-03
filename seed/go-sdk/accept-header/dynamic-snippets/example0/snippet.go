package example

import (
    context "context"

    client "github.com/accept-header/fern/client"
    option "github.com/accept-header/fern/option"
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
    err := client.Service.Endpoint(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
