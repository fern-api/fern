package example

import (
    context "context"

    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    _, err := client.FolderD.Service.GetDirectThread(
        context.TODO(),
    )
    if err != nil {
        return err
    }
    return nil
}
