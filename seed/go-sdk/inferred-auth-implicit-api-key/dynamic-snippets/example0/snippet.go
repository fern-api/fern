package example

import (
    client "github.com/inferred-auth-implicit-api-key/fern/client"
    option "github.com/inferred-auth-implicit-api-key/fern/option"
    fern "github.com/inferred-auth-implicit-api-key/fern"
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
        ApiKey: "api_key",
    }
    client.Auth.GetToken(
        context.TODO(),
        request,
    )
}
