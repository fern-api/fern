package example

import (
    context "context"

    client "github.com/unions/fern/client"
    option "github.com/unions/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Bigunion.Get(
        context.TODO(),
        "id",
    )
    if err != nil {
        return err
    }
    return nil
}
