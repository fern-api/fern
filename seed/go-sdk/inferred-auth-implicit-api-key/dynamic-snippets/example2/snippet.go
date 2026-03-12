package example

import (
    client "github.com/inferred-auth-implicit-api-key/fern/client"
    option "github.com/inferred-auth-implicit-api-key/fern/option"
    context "context"
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
    client.Nested.Api.GetSomething(
        context.TODO(),
    )
}
