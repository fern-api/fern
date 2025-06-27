package example

import (
    client "github.com/multi-line-docs/fern/client"
    option "github.com/multi-line-docs/fern/option"
    context "context"
    fern "github.com/multi-line-docs/fern"
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
            Age: fern.Int(
                1,
            ),
        },
    )
}
