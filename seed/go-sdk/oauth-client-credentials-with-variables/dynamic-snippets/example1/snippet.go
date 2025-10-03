package example

import (
    client "github.com/oauth-client-credentials-with-variables/fern/client"
    option "github.com/oauth-client-credentials-with-variables/fern/option"
    fern "github.com/oauth-client-credentials-with-variables/fern"
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
