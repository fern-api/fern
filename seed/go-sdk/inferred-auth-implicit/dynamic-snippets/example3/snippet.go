package example

import (
    context "context"
    client "github.com/inferred-auth-implicit/fern/client"
    option "github.com/inferred-auth-implicit/fern/option"
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
    client.Nested.Api.GetSomething(
        context.TODO(),
    )
}
