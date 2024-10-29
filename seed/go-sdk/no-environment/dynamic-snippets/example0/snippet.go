package example

import (
    client "github.com/no-environment/fern/client"
    option "github.com/no-environment/fern/option"
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
