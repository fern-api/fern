package example

import (
    context "context"

    client "github.com/undiscriminated-union-with-response-property/fern/client"
    option "github.com/undiscriminated-union-with-response-property/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.GetUnion(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
