package example

import (
    client "github.com/folders/fern/client"
    context "context"
)

func do() () {
    client := client.NewClient()
    client.Foo(
        context.TODO(),
    )
}
