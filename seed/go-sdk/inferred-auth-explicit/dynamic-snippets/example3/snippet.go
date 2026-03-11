package example

import (
    client "github.com/inferred-auth-explicit/fern/client"
    option "github.com/inferred-auth-explicit/fern/option"
    context "context"
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
