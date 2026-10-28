package example

import (
    context "context"

    client "github.com/alias/fern/client"
    option "github.com/alias/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    err := client.Get(
        context.TODO(),
        "typeId",
    )
    if err != nil {
        return err
    }
    return nil
}
