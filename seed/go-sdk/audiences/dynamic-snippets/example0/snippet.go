package example

import (
    client "github.com/audiences/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.FolderA.Service.GetDirectThread(
        context.TODO(),
    )
}
