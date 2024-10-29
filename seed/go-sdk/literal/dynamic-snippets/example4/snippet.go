package example

import (
    client "github.com/literal/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Path.Send(
        context.TODO(),
    )
}
