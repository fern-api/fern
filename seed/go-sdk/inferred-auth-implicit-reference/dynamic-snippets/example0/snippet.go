package example

import (
    context "context"

    fern "github.com/inferred-auth-implicit-reference/fern"
    client "github.com/inferred-auth-implicit-reference/fern/client"
    option "github.com/inferred-auth-implicit-reference/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientId(
            "client_id",
        ),
        option.WithClientSecret(
            "client_secret",
        ),
    )
    request := &fern.GetTokenRequest{
        ClientId: "client_id",
        ClientSecret: "client_secret",
        Scope: fern.String(
            "scope",
        ),
    }
    client.Auth.GetTokenWithClientCredentials(
        context.TODO(),
        request,
    )
}
