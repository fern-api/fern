package example

import (
    client "github.com/cross-package-type-names/fern/client"
    context "context"
    fern "github.com/cross-package-type-names/fern"
)

func do() () {
    client := client.NewClient()
    client.Foo.Find(
        context.TODO(),
        &fern.FindRequest{},
    )}
