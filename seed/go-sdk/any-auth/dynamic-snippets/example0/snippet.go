package example

import (
    client "github.com/any-auth/fern/client"
    option "github.com/any-auth/fern/option"
    fern "github.com/any-auth/fern"
    context "context"
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
        ClientId: "client_id",
        ClientSecret: "client_secret",
    }
    client.Auth.GetToken(
        context.TODO(),
        request,
    )
}
