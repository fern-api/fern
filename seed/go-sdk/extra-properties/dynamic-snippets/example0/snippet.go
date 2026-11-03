package example

import (
    context "context"

    fern "github.com/extra-properties/fern"
    client "github.com/extra-properties/fern/client"
    option "github.com/extra-properties/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.CreateUserRequest{
        Name: "Alice",
    }
    _, err := client.User.CreateUser(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
