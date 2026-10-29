package example

import (
    context "context"

    client "github.com/file-upload/fern/client"
    option "github.com/file-upload/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    err := client.Service.Simple(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
