package example

import (
    context "context"

    client "github.com/fern-api/file-upload-go/client"
    option "github.com/fern-api/file-upload-go/option"
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
