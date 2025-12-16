package example

import (
    client "github.com/inferred-auth-explicit/fern/client"
    option "github.com/inferred-auth-explicit/fern/option"
    fern "github.com/inferred-auth-explicit/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        nil,
    )
    request := &fern.GetTokenRequest{
        XApiKey: "X-Api-Key",
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
