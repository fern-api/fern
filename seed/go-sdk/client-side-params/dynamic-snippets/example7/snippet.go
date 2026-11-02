package example

import (
    context "context"

    client "github.com/client-side-params/fern/client"
    option "github.com/client-side-params/fern/option"
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
    err := client.Service.DeleteUser(
        context.TODO(),
        "userId",
    )
    if err != nil {
        return err
    }
    return nil
}
