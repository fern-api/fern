package example

import (
    context "context"

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
    client.NestedNoAuth.Api.GetSomething(
        context.TODO(),
    )
}
