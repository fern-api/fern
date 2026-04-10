package example

import (
    context "context"

    fern "github.com/extra-properties/fern"
    client "github.com/extra-properties/fern/client"
    option "github.com/extra-properties/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateUserRequest{
        Name: "name",
    }
    client.User.CreateUser(
        context.TODO(),
        request,
    )
}
