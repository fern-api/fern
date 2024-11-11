package example

import (
    client "github.com/fern-api/unions-go/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Union.Get(
        context.TODO(),
        "id",
    )
}
