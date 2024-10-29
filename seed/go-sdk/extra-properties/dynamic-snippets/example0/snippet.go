package example

import (
    client "github.com/extra-properties/fern/client"
    context "context"
    fern "github.com/extra-properties/fern"
)

func do() () {
    client := client.NewClient()
    client.User.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Name: "name",
        },
    )
}
