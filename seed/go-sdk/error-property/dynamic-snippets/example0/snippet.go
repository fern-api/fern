package example

import (
    context "context"

    client "github.com/error-property/fern/client"
    option "github.com/error-property/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.PropertyBasedError.ThrowError(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
