package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    path "github.com/fern-api/path-parameters-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.UpdateUserRequest{
        Body: &path.User{
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
