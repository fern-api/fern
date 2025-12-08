package example

import (
    client "github.com/oauth-client-credentials-environment-variables/fern/client"
    option "github.com/oauth-client-credentials-environment-variables/fern/option"
    core "github.com/oauth-client-credentials-environment-variables/fern/core"
    fern "github.com/oauth-client-credentials-environment-variables/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithOAuthTokenProvider(
            core.NewOAuthTokenProvider(
                "<clientId>",
                "<clientSecret>",
                nil,
            ),
        ),
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
