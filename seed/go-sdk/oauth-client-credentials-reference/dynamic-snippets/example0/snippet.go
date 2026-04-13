package example

import (
    context "context"

    fern "github.com/oauth-client-credentials-reference/fern"
    client "github.com/oauth-client-credentials-reference/fern/client"
    option "github.com/oauth-client-credentials-reference/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.GetTokenRequest{
        ClientID: "client_id",
        ClientSecret: "client_secret",
    }
    client.Auth.Gettoken(
        context.TODO(),
        request,
    )
}
