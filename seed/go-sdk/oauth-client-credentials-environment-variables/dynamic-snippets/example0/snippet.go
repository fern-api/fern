package example

import (
    client "github.com/oauth-client-credentials-environment-variables/fern/client"
    context "context"
    fern "github.com/oauth-client-credentials-environment-variables/fern"
)

func do() () {
    client := client.NewClient()
    client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        &fern.GetTokenRequest{
            ClientId: "client_id",
            ClientSecret: "client_secret",
            Scope: fern.String(
                "scope",
            ),
        },
    )
}
