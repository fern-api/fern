package example

import (
    context "context"

    client "github.com/allof-inline/fern/client"
    option "github.com/allof-inline/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.ListUsers(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
