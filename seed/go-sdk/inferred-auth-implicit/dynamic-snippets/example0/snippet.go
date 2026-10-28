package example

import (
    context "context"

    fern "github.com/inferred-auth-implicit/fern"
    client "github.com/inferred-auth-implicit/fern/client"
    option "github.com/inferred-auth-implicit/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithXAPIKey(
            "X-Api-Key",
        ),
        option.WithClientID(
            "client_id",
        ),
        option.WithClientSecret(
            "client_secret",
        ),
    )
    request := &fern.GetTokenRequest{
        XAPIKey: "X-Api-Key",
        ClientID: "client_id",
        ClientSecret: fern.String(
            "client_secret",
        ),
        Scope: fern.String(
            "scope",
        ),
    }
    _, err := client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
