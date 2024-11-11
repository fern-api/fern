package example

import (
    client "github.com/package-yml/fern/client"
    context "context"
    fern "github.com/package-yml/fern"
)

func do() () {
    client := client.NewClient()
    client.Echo(
        context.TODO(),
        "id",
        &fern.EchoRequest{
            Name: "name",
            Size: 1,
        },
    )
}
