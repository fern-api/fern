package example

import (
    client "github.com/variables/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Service.Post(
        context.TODO(),
        "endpointParam",
    )
}
