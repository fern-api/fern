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
        Name: "name",
        Size: 1,
    }
    client.Echo(
        context.TODO(),
        "id",
        request,
    )
}
