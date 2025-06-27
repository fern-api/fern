package example

import (
    fern "github.com/package-yml/fern"
    option "github.com/package-yml/fern/option"
    context "context"
)

func do() {
    client := fern.New(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Echo(
        context.TODO(),
        "id",
        &fern.EchoRequest{
            Name: "name",
            Size: 1,
        },
    )
}
