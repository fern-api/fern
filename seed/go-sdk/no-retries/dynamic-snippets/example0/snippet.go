package example

import (
    context "context"

    client "github.com/no-retries/fern/client"
    option "github.com/no-retries/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Retries.GetUsers(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
