package example

import (
    context "context"

    client "github.com/go-global-headers/fern/client"
    option "github.com/go-global-headers/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithAPIKey(
            "<token>",
        ),
        option.WithClientID(
            "<X-API-Client-Id>",
        ),
        option.WithVersion(
            "<X-API-Version>",
        ),
    )
    _, err := client.Service.Get(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
