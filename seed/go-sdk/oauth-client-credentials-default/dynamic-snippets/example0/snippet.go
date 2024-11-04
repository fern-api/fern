package example

import (
    client "github.com/oauth-client-credentials-default/fern/client"
    context "context"
    fern "github.com/oauth-client-credentials-default/fern"
)

func do() () {
    client := client.NewClient()
    client.Auth.GetToken(
        context.TODO(),
        &fern.GetTokenRequest{
            ClientId: "client_id",
            ClientSecret: "client_secret",
        },
    )
}
