package example

import (
    context "context"

    path "github.com/fern-api/path-parameters-go"
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.UpdateUserRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
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
        request,
    )
}
