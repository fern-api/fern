package example

import (
    client "github.com/license/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Get(
        context.TODO(),
    )
}
