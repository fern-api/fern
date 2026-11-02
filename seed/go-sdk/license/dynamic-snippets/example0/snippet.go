package example

import (
    context "context"

    client "github.com/license/fern/client"
    option "github.com/license/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    err := client.Get(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
