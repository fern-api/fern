package example

import (
    context "context"
    fern "github.com/inferred-auth-explicit/fern"
    client "github.com/inferred-auth-explicit/fern/client"
    option "github.com/inferred-auth-explicit/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithXApiKey(
            "X-Api-Key",
        ),
        option.WithClientId(
            "client_id",
        ),
        option.WithClientSecret(
            "client_secret",
        ),
    )
    request := &fern.RefreshTokenRequest{
        XApiKey: "X-Api-Key",
        ClientId: "client_id",
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
