package example

import (
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
    fern "github.com/path-parameters/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UpdateUserRequest{
        Body: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
    }
    client.User.UpdateUser(
        context.TODO(),
        "tenant_id",
        "user_id",
        request,
    )
}
