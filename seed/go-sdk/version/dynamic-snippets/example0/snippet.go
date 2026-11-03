package example

import (
    context "context"

    client "github.com/version/fern/client"
    option "github.com/version/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.User.GetUser(
        context.TODO(),
        "userId",
    )
    if err != nil {
        return err
    }
    return nil
}
