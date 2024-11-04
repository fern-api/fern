package example

import (
    client "github.com/unknown/fern/client"
    context "context"
    fern "github.com/unknown/fern"
)

func do() () {
    client := client.NewClient()
    client.Unknown.PostObject(
        context.TODO(),
        &fern.MyObject{
            Unknown: map[string]interface{}{
                "key": "value",
            },
        },
    )
}
