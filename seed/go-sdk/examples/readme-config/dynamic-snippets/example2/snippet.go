package example

import (
    context "context"

    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
)

func do() {
    client := client.New(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := "primitive"
    client.Echo(
        context.TODO(),
        request,
    )
}
