package example

import (
    context "context"

    client "github.com/go-nullable-wire-tests/fern/client"
    option "github.com/go-nullable-wire-tests/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Things.GetThing(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
