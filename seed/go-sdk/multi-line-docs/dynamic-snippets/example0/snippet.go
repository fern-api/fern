package example

import (
    client "github.com/multi-line-docs/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.User.GetUser(
        context.TODO(),
        "userId",
    )
}
