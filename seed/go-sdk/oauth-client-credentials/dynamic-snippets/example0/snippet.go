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
        nil,
    )
    client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        &fern.GetTokenRequest{
            ClientId: "my_oauth_app_123",
            ClientSecret: "sk_live_abcdef123456789",
            Scope: fern.String(
                "read:users",
            ),
        },
    )
}
