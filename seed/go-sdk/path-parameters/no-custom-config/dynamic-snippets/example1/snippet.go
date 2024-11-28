package example

import (
    client "github.com/path-parameters/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.User.GetUser(
        context.TODO(),
        "userId",
    )
}
