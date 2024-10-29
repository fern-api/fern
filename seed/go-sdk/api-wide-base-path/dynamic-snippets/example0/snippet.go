package example

import (
    client "github.com/api-wide-base-path/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Service.Post(
        context.TODO(),
        "pathParam",
        "serviceParam",
        "resourceParam",
        1,
    )
}
