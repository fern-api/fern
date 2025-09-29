package example

import (
    client "github.com/inferred-auth-explicit/fern/client"
    option "github.com/inferred-auth-explicit/fern/option"
    fern "github.com/inferred-auth-explicit/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
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
