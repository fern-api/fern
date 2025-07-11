package example

import (
    client "github.com/package-yml/fern/client"
    option "github.com/package-yml/fern/option"
    context "context"
    fern "github.com/package-yml/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Echo(
        context.TODO(),
        "id-ksfd9c1",
        &fern.EchoRequest{
            Name: "Hello world!",
            Size: 20,
        },
    )
}
