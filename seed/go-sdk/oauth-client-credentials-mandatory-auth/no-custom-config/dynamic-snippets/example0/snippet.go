package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-mandatory-auth/fern"
    client "github.com/oauth-client-credentials-mandatory-auth/fern/client"
    option "github.com/oauth-client-credentials-mandatory-auth/fern/option"
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
    request := &fern.GetTokenRequest{
        ClientID: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
        Scope: fern.String(
            "read:users",
        ),
    }
    _, err := client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
