package example

import (
    context "context"

    fern "github.com/multi-line-docs/fern"
    client "github.com/multi-line-docs/fern/client"
    option "github.com/multi-line-docs/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateUserRequest{
        Name: "name",
        Age: fern.Int(
            1,
        ),
    }
    client.User.CreateUser(
        context.TODO(),
        request,
    )
}
