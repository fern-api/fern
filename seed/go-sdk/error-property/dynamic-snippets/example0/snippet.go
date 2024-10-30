package example

import (
    client "github.com/error-property/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.PropertyBasedError.ThrowError(
        context.TODO(),
    )
}
