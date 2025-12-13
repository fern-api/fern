package example

import (
    client "github.com/oauth-client-credentials-mandatory-auth/fern/client"
    option "github.com/oauth-client-credentials-mandatory-auth/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientCredentials(
            "<clientId>",
            "<clientSecret>",
        ),
    )
    client.Nested.Api.GetSomething(
        context.TODO(),
    )
}
