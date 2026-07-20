package example

import (
    context "context"

    fern "github.com/go-oauth-token-nullable/fern"
    client "github.com/go-oauth-token-nullable/fern/client"
    option "github.com/go-oauth-token-nullable/fern/option"
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
        ClientID: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
    }
    client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        request,
    )
}
