package example

import (
    fern "github.com/package-yml/fern"
    option "github.com/package-yml/fern/option"
    context "context"
)

func do() {
    client := fern.NewClient(
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
