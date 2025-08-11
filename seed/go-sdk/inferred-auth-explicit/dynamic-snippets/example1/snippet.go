package example

import (
    client "github.com/inferred-auth-explicit/fern/client"
    option "github.com/inferred-auth-explicit/fern/option"
    context "context"
    fern "github.com/inferred-auth-explicit/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Auth.RefreshToken(
        context.TODO(),
        &fern.RefreshTokenRequest{
            ClientId: "client_id",
            ClientSecret: "client_secret",
            RefreshToken: "refresh_token",
            Scope: fern.String(
                "scope",
            ),
        },
    )
}
