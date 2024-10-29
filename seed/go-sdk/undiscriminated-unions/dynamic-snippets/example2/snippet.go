package example

import (
    client "github.com/fern-api/undiscriminated-go/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Union.GetMetadata(
        context.TODO(),
    )
}
