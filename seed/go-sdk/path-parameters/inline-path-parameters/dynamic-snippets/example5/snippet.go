package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient()
    client.User.UpdateUser(
        context.TODO(),
        &path.UpdateUserRequest{
            TenantId: "tenant_id",
            UserId: "user_id",
            Body: &path.User{
                Name: "name",
                Tags: []string{
                    "tags",
                    "tags",
                },
            },
        },
    )
}
