package example

import (
    client "github.com/oauth-client-credentials/fern/client"
    option "github.com/oauth-client-credentials/fern/option"
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
    client.Simple.GetSomething(
        context.TODO(),
    )
}
