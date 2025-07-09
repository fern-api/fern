package example

import (
    client "github.com/oauth-client-credentials-with-variables/fern/client"
    option "github.com/oauth-client-credentials-with-variables/fern/option"
    context "context"
    fern "github.com/oauth-client-credentials-with-variables/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
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
