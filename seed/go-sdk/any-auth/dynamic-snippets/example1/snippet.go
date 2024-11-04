package example

import (
    client "github.com/any-auth/fern/client"
    option "github.com/any-auth/fern/option"
    context "context"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.User.Get(
        context.TODO(),
    )
}
