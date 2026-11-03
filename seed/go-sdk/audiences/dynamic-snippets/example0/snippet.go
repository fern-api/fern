package example

import (
    context "context"

    client "github.com/audiences/fern/client"
    foldera "github.com/audiences/fern/foldera"
    option "github.com/audiences/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &foldera.GetDirectThreadRequest{
        IDs: []string{
            "ids",
        },
        Tags: []string{
            "tags",
        },
    }
    _, err := client.FolderA.Service.GetDirectThread(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
