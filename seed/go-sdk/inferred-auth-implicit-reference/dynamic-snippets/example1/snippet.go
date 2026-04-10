package example

import (
    context "context"

    fern "github.com/inferred-auth-implicit-reference/fern"
    client "github.com/inferred-auth-implicit-reference/fern/client"
    option "github.com/inferred-auth-implicit-reference/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientID(
            "client_id",
        ),
        option.WithClientSecret(
            "client_secret",
        ),
    )
    request := &fern.RefreshTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        RefreshToken: "refresh_token",
        Scope: fern.String(
            "scope",
        ),
    }
    client.Auth.RefreshToken(
        context.TODO(),
        request,
    )
}
