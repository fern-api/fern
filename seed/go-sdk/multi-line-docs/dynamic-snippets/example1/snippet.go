package example

import (
    client "github.com/multi-line-docs/fern/client"
    context "context"
    fern "github.com/multi-line-docs/fern"
)

func do() () {
    client := client.NewClient()
    client.User.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Name: "name",
            Age: fern.Int(
                1,
            ),
        },
    )
}
