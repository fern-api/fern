package example

import (
    context "context"

    client "github.com/fern-api/undiscriminated-go/client"
    option "github.com/fern-api/undiscriminated-go/option"
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
