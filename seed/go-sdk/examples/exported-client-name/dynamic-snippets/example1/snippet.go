package example

import (
    client "github.com/examples/fern/client"
    option "github.com/examples/fern/option"
    context "context"
)

func do() () {
    client := client.NewAcmeClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.Echo(
        context.TODO(),
        "string",
    )
}
