package example

import (
    context "context"

    fern "github.com/package-yml/fern"
    client "github.com/package-yml/fern/client"
    option "github.com/package-yml/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.EchoRequest{
        Name: "Hello world!",
        Size: 20,
    }
    client.Echo(
        context.TODO(),
        "id-ksfd9c1",
        request,
    )
}
