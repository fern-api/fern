package example

import (
    client "github.com/oauth-client-credentials/fern/client"
    context "context"
    fern "github.com/oauth-client-credentials/fern"
)

func do() () {
    client := client.NewClient()
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
