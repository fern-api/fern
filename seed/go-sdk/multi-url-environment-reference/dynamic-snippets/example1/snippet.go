package example

import (
    context "context"

    client "github.com/multi-url-environment-reference/fern/client"
    option "github.com/multi-url-environment-reference/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    _, err := client.Items.ListItems(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
