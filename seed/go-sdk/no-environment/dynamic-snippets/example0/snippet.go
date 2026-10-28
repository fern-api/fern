package example

import (
    context "context"

    client "github.com/no-environment/fern/client"
    option "github.com/no-environment/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    _, err := client.Dummy.GetDummy(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
