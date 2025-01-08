package example

import (
    client "github.com/plain-text/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Service.GetText(
        context.TODO(),
    )
}
