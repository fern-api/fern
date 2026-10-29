package example

import (
    context "context"

    client "github.com/mixed-case/fern/client"
    option "github.com/mixed-case/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Service.GetResource(
        context.TODO(),
        "ResourceID",
    )
    if err != nil {
        return err
    }
    return nil
}
