package example

import (
    client "github.com/oauth-client-credentials-default/fern/client"
    option "github.com/oauth-client-credentials-default/fern/option"
    context "context"
    fern "github.com/oauth-client-credentials-default/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Auth.GetToken(
        context.TODO(),
        &fern.GetTokenRequest{
            ClientId: "client_id",
            ClientSecret: "client_secret",
        },
    )
}
