package example

import (
    client "github.com/any-auth/fern/client"
    option "github.com/any-auth/fern/option"
    context "context"
    fern "github.com/any-auth/fern"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.Auth.GetToken(
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
