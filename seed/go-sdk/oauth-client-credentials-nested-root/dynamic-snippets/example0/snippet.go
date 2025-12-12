package example

import (
    client "github.com/oauth-client-credentials-nested-root/fern/client"
    option "github.com/oauth-client-credentials-nested-root/fern/option"
    auth "github.com/oauth-client-credentials-nested-root/fern/auth"
    fern "github.com/oauth-client-credentials-nested-root/fern"
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
    request := &auth.GetTokenRequest{
        ClientId: "client_id",
        ClientSecret: "client_secret",
        Scope: fern.String(
            "scope",
        ),
    }
    client.Auth.GetToken(
        context.TODO(),
        request,
    )
}
