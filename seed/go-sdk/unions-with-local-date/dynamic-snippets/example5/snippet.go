package example

import (
    context "context"

    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Types.Get(
        context.TODO(),
        "id",
    )
    if err != nil {
        return err
    }
    return nil
}
