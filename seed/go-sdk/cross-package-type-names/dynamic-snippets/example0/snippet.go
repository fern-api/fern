package example

import (
    client "github.com/cross-package-type-names/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.FolderA.Service.GetDirectThread(
        context.TODO(),
    )
}
