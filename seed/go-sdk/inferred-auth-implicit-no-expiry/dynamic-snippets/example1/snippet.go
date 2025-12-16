package example

import (
    client "github.com/inferred-auth-implicit-no-expiry/fern/client"
    option "github.com/inferred-auth-implicit-no-expiry/fern/option"
    fern "github.com/inferred-auth-implicit-no-expiry/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        nil,
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
