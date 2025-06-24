package example

import (
    client "github.com/extra-properties/fern/client"
    option "github.com/extra-properties/fern/option"
    context "context"
    fern "github.com/extra-properties/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.CreateUser(
        context.TODO(),
        &fern.CreateUserRequest{
            Name: "name",
        },
    )
}
