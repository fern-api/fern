package example

import (
    client "github.com/alias/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Get(
        context.TODO(),
        "typeId",
    )
}
