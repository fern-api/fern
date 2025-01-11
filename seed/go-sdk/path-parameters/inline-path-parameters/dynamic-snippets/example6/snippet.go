package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient()
    client.User.SearchUsers(
        context.TODO(),
        &path.SearchUsersRequest{
            TenantId: "tenant_id",
            UserId: "user_id",
            Limit: path.Int(
                1,
            ),
        },
    )
}
