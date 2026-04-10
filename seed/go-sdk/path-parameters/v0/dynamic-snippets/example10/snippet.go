package example

import (
    context "context"

    fern "github.com/path-parameters/fern"
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UserCreateUserRequest{
        Body: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
            },
        },
    }
    client.User.Createuser(
        context.TODO(),
        "tenant_id",
        request,
    )
}
