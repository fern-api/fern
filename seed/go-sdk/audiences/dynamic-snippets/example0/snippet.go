package example

import (
    client "github.com/audiences/fern/client"
    option "github.com/audiences/fern/option"
    foldera "github.com/audiences/fern/foldera"
    context "context"
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
