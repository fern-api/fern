package example

import (
    context "context"
    client "github.com/audiences/fern/client"
    foldera "github.com/audiences/fern/foldera"
    option "github.com/audiences/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &foldera.GetDirectThreadRequest{
        Ids: []string{
            "ids",
        },
        Tags: []string{
            "tags",
        },
    }
    client.FolderA.Service.GetDirectThread(
        context.TODO(),
        request,
    )
}
