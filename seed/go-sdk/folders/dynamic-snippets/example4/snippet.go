package example

import (
    client "github.com/folders/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Folder.Service.Endpoint(
        context.TODO(),
    )
}
