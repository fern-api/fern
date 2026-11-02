package example

import (
    context "context"

    client "github.com/any-auth/fern/client"
    option "github.com/any-auth/fern/option"
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
    _, err := client.User.GetAdmins(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
