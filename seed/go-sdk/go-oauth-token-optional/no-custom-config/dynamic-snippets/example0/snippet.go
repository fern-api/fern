package example

import (
    context "context"

    fern "github.com/go-oauth-token-optional/fern"
    client "github.com/go-oauth-token-optional/fern/client"
    option "github.com/go-oauth-token-optional/fern/option"
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
    request := &fern.CreateOauth2TokenRequest{
        ClientID: "my_oauth_app_123",
        ClientSecret: "sk_live_abcdef123456789",
        GrantType: fern.String(
            "client_credentials",
        ),
    }
    client.Auth.CreateOauth2Token(
        context.TODO(),
        request,
    )
}
