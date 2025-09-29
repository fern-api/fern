package example

import (
    client "github.com/package-yml/fern/client"
    option "github.com/package-yml/fern/option"
    fern "github.com/package-yml/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.EchoRequest{
        Name: "name",
        Size: 1,
    }
    client.Echo(
        context.TODO(),
        "id",
        request,
    )
}
