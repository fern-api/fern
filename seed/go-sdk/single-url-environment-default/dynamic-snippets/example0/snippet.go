package example

import (
    client "github.com/single-url-environment-default/fern/client"
    option "github.com/single-url-environment-default/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.Dummy.GetDummy(
        context.TODO(),
    )
}
