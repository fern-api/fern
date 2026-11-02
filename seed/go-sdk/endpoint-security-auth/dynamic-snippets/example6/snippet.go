package example

import (
    context "context"

    client "github.com/endpoint-security-auth/fern/client"
    option "github.com/endpoint-security-auth/fern/option"
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
    _, err := client.User.GetWithAnyAuth(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
