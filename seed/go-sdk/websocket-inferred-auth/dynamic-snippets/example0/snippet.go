package example

import (
    context "context"
    fern "github.com/websocket-inferred-auth/fern"
    client "github.com/websocket-inferred-auth/fern/client"
    option "github.com/websocket-inferred-auth/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithXApiKey(
            "X-Api-Key",
        ),
        option.WithClientId(
            "client_id",
        ),
        option.WithClientSecret(
            "client_secret",
        ),
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
