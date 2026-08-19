package example

import (
    context "context"

    client "github.com/oauth-client-credentials-openapi/fern/client"
    option "github.com/oauth-client-credentials-openapi/fern/option"
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
    client.Plants.List(
        context.TODO(),
    )
}
