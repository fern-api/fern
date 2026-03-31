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
        option.WithApiKey(
            "X-Api-Key",
        ),
    )
    request := &fern.GetTokenRequest{
        ApiKey: "api_key",
    }
    client.Auth.GetToken(
        context.TODO(),
        request,
    )
}
