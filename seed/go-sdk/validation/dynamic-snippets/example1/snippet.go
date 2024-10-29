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
            Decimal: 1.1,
            Even: 1,
            Name: "name",
        },
    )
}
