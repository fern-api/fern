package example

import (
    context "context"

    fern "github.com/endpoint-security-auth/fern"
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
    request := &fern.GetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
    }
    _, err := client.Auth.GetToken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
