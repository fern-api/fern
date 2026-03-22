package example

import (
    context "context"
    fern "github.com/oauth-client-credentials/fern"
    client "github.com/oauth-client-credentials/fern/client"
    option "github.com/oauth-client-credentials/fern/option"
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
    request := &fern.GetTokenRequest{
        ClientId: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
        Scope: fern.String(
            "read:users",
        ),
    }
    client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        request,
    )
}
