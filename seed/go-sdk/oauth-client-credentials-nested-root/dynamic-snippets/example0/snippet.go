package example

import (
    client "github.com/oauth-client-credentials-nested-root/fern/client"
    option "github.com/oauth-client-credentials-nested-root/fern/option"
    context "context"
    auth "github.com/oauth-client-credentials-nested-root/fern/auth"
    fern "github.com/oauth-client-credentials-nested-root/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Auth.GetToken(
        context.TODO(),
        &auth.GetTokenRequest{
            ClientId: "client_id",
            ClientSecret: "client_secret",
            Scope: fern.String(
                "scope",
            ),
        },
    )
}
