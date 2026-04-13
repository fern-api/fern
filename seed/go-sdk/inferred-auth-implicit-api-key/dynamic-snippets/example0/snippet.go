package example

import (
    context "context"

    fern "github.com/inferred-auth-implicit-api-key/fern"
    client "github.com/inferred-auth-implicit-api-key/fern/client"
    option "github.com/inferred-auth-implicit-api-key/fern/option"
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
    request := &fern.AuthGetTokenRequest{
        APIKey: "X-Api-Key",
    }
    client.Auth.Gettoken(
        context.TODO(),
        request,
    )
}
