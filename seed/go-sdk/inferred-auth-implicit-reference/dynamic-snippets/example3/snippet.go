package example

import (
    client "github.com/inferred-auth-implicit-reference/fern/client"
    option "github.com/inferred-auth-implicit-reference/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
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
