package example

import (
    context "context"

    fern "github.com/oauth-client-credentials/fern"
    client "github.com/oauth-client-credentials/fern/client"
    option "github.com/oauth-client-credentials/fern/option"
)

func do() error {
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
        ClientID: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
        RefreshToken: "refresh_token",
        Scope: fern.String(
            "read:users",
        ),
    }
    _, err := client.Auth.RefreshToken(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
