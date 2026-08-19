package example

import (
    context "context"

    fern "github.com/any-auth/fern"
    client "github.com/any-auth/fern/client"
    option "github.com/any-auth/fern/option"
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
    client.Auth.GetToken(
        context.TODO(),
        request,
    )
}
