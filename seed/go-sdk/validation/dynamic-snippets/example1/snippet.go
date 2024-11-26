package example

import (
    client "github.com/validation/fern/client"
    context "context"
    fern "github.com/validation/fern"
)

func do() () {
    client := client.NewClient()
    client.Get(
        context.TODO(),
        &fern.GetRequest{
            Decimal: 2.2,
            Even: 100,
            Name: "foo",
        },
    )
}
