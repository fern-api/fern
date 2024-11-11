package example

import (
    client "github.com/optional/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Optional.SendOptionalBody(
        context.TODO(),
        map[string]interface{}{
            "string": map[string]interface{}{
                "key": "value",
            },
        },
    )
}
