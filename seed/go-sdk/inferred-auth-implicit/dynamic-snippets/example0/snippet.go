package example

import (
    client "github.com/inferred-auth-implicit/fern/client"
    option "github.com/inferred-auth-implicit/fern/option"
    context "context"
    fern "github.com/inferred-auth-implicit/fern"
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
