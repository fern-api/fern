package example

import (
    context "context"

    client "github.com/simple-api/fern/client"
    option "github.com/simple-api/fern/option"
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
    _, err := client.User.Get(
        context.TODO(),
        "id",
    )
    if err != nil {
        return err
    }
    return nil
}
