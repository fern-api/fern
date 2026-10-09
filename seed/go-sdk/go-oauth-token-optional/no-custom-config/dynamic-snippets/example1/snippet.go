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
        ClientID: "client_id",
        ClientSecret: "client_secret",
        GrantType: fern.String(
            "grant_type",
        ),
    }
    client.Auth.CreateOauth2Token(
        context.TODO(),
        request,
    )
}
