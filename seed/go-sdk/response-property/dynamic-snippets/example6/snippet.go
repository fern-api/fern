package example

import (
    client "github.com/response-property/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Service.GetMovie(
        context.TODO(),
        "string",
    )
}
