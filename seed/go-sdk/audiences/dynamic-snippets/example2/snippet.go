package example

import (
    client "github.com/audiences/fern/client"
    context "context"
    fern "github.com/audiences/fern"
)

func do() () {
    client := client.NewClient()
    client.Foo.Find(
        context.TODO(),
        &fern.FindRequest{},
    )}
