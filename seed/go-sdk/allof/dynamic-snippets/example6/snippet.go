package example

import (
    context "context"

    client "github.com/allof/fern/client"
    option "github.com/allof/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.GetEntity(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
