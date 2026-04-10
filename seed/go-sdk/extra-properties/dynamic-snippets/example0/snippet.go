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
    request := &fern.UserCreateUserRequest{
        Type: fern.UserCreateUserRequestTypeCreateUserRequest,
        Version: fern.UserCreateUserRequestVersionV1,
        Name: "name",
    }
    client.User.Createuser(
        context.TODO(),
        request,
    )
}
