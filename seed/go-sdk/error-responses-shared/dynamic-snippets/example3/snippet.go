package example

import (
    context "context"

    client "github.com/error-responses-shared/fern/client"
    option "github.com/error-responses-shared/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Calls.Calls.CreateCall(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
