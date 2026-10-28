package example

import (
    context "context"

    client "github.com/openapi-per-spec-base-path/fern/client"
    option "github.com/openapi-per-spec-base-path/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithClientCredentials(
            "<clientId>",
            "<clientSecret>",
        ),
    )
    _, err := client.ListItems(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
