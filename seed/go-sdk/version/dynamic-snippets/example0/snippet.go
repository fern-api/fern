package example

import (
    client "github.com/version/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.User.GetUser(
        context.TODO(),
        "userId",
    )
}
