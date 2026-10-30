package example

import (
    context "context"

    client "github.com/literal/fern/client"
    option "github.com/literal/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Headers.SendLiteralsOnly(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
