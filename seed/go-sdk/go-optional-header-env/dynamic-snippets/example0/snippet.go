package example

import (
    context "context"

    client "github.com/go-optional-header-env/fern/client"
    option "github.com/go-optional-header-env/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithAPIKey(
            "<token>",
        ),
    )
    _, err := client.Service.GetWithAPIVersion(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
