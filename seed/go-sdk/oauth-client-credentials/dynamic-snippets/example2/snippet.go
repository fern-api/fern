package example

import (
    client "github.com/oauth-client-credentials/fern/client"
    option "github.com/oauth-client-credentials/fern/option"
    fern "github.com/oauth-client-credentials/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientCredentials(
            "<clientId>",
            "<clientSecret>",
        ),
    )
    request := &fern.RefreshTokenRequest{
        ClientId: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
        RefreshToken: "refresh_token",
        Scope: fern.String(
            "read:users",
        ),
    }
    client.Auth.RefreshToken(
        context.TODO(),
        request,
    )
}
