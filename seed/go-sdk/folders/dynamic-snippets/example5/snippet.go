package example

import (
    client "github.com/folders/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Folder.Service.UnknownRequest(
        context.TODO(),
        map[string]interface{}{
            "key": "value",
        },
    )
}
