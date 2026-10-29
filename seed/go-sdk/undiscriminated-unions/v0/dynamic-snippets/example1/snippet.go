package example

import (
    context "context"

    client "github.com/undiscriminated-unions/fern/client"
    option "github.com/undiscriminated-unions/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Union.GetMetadata(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
