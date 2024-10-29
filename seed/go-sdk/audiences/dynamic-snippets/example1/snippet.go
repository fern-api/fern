package example

import (
    client "github.com/audiences/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.FolderD.Service.GetDirectThread(
        context.TODO(),
    )
}
