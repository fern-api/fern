package example

import (
    client "github.com/inferred-auth-implicit-no-expiry/fern/client"
    option "github.com/inferred-auth-implicit-no-expiry/fern/option"
    context "context"
    fern "github.com/inferred-auth-implicit-no-expiry/fern"
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
            XApiKey: "X-Api-Key",
            ClientId: "client_id",
            ClientSecret: "client_secret",
            Scope: fern.String(
                "scope",
            ),
        },
    )
}
