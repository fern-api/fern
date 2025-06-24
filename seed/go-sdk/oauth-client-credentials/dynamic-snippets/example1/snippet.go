package example

import (
    client "github.com/oauth-client-credentials/fern/client"
    option "github.com/oauth-client-credentials/fern/option"
    context "context"
    fern "github.com/oauth-client-credentials/fern"
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
