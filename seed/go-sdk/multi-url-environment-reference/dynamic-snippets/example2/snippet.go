package example

import (
    context "context"

    fern "github.com/multi-url-environment-reference/fern"
    client "github.com/multi-url-environment-reference/fern/client"
    option "github.com/multi-url-environment-reference/fern/option"
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
    request := &fern.AuthGetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
    }
    _, err := client.Auth.Gettoken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
