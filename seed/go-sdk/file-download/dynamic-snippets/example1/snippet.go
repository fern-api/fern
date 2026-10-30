package example

import (
    context "context"

    client "github.com/file-download/fern/client"
    option "github.com/file-download/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.Service.DownloadFile(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
