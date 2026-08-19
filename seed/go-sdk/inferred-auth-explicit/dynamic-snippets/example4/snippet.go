package example

import (
    context "context"

    client "github.com/inferred-auth-explicit/fern/client"
    option "github.com/inferred-auth-explicit/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithXAPIKey(
            "X-Api-Key",
        ),
        option.WithClientID(
            "client_id",
        ),
        option.WithClientSecret(
            "client_secret",
        ),
    )
    client.Simple.GetSomething(
        context.TODO(),
    )
}
