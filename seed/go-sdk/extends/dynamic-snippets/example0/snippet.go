package example

import (
    client "github.com/extends/fern/client"
    context "context"
    fern "github.com/extends/fern"
)

func do() () {
    client := client.NewClient()
    client.ExtendedInlineRequestBody(
        context.TODO(),
        &fern.Inlined{
            Unique: "unique",
        },
    )
}
