package example

import (
    context "context"

    client "github.com/openapi-per-spec-base-path-disabled/fern/client"
    option "github.com/openapi-per-spec-base-path-disabled/fern/option"
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
    client.ListItems(
        context.TODO(),
    )
}
