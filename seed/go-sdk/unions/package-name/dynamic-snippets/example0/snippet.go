package example

import (
    context "context"

    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
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
