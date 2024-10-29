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
        "id-ksfd9c1",
        &fern.EchoRequest{
            Name: "Hello world!",
            Size: 20,
        },
    )
}
