package example

import (
    context "context"

    client "github.com/cli-oauth/fern/client"
    option "github.com/cli-oauth/fern/option"
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
    client.System.Health(
        context.TODO(),
    )
}
