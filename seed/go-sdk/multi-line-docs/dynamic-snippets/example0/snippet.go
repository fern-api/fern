package example

import (
    context "context"

    client "github.com/multi-line-docs/fern/client"
    option "github.com/multi-line-docs/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    err := client.User.GetUser(
        context.TODO(),
        "userId",
    )
    if err != nil {
        return err
    }
    return nil
}
