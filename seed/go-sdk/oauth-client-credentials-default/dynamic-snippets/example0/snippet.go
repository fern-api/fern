package example

import (
    client "github.com/oauth-client-credentials-default/fern/client"
    option "github.com/oauth-client-credentials-default/fern/option"
    core "github.com/oauth-client-credentials-default/fern/core"
    fern "github.com/oauth-client-credentials-default/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithOAuthTokenProvider(
            core.NewOAuthTokenProvider(
                "<clientId>",
                "<clientSecret>",
                nil,
            ),
        ),
    )
    request := &fern.GetTokenRequest{
        ClientId: "client_id",
        ClientSecret: "client_secret",
    }
    client.Auth.GetToken(
        context.TODO(),
        request,
    )
}
