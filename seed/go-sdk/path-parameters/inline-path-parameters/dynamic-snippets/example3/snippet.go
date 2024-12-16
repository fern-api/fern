package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient()
    client.User.GetUser(
        context.TODO(),
        &path.GetUsersRequest{
            TenantId: "tenantId",
            UserId: "userId",
        },
    )
}
