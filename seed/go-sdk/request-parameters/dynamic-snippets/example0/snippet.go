package example

import (
    context "context"

    fern "github.com/request-parameters/fern"
    client "github.com/request-parameters/fern/client"
    option "github.com/request-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UserCreateUsernameRequest{
        Tags: []*string{
            fern.String(
                "tags",
            ),
        },
        Username: "username",
        Password: "password",
        Name: "name",
    }
    client.User.Createusername(
        context.TODO(),
        request,
    )
}
