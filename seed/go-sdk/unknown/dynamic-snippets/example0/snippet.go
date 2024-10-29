package example

import (
    client "github.com/unknown/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Unknown.Post(
        context.TODO(),
        map[string]interface{}{
            "key": "value",
        },
    )
}
