package example

import (
    context "context"

    fern "github.com/cli-oauth/fern"
    client "github.com/cli-oauth/fern/client"
    option "github.com/cli-oauth/fern/option"
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
    request := &fern.GetTokenAuthRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
        Scopes: "scopes",
        GrantType: fern.GetTokenAuthRequestGrantTypeClientCredentials,
        Tenant: "tenant",
    }
    client.Auth.GetToken(
        context.TODO(),
        request,
    )
}
