package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.GetUser(
        context.TODO(),
        &path.GetUsersRequest{
            TenantId: "tenant_id",
            UserId: "user_id",
        },
    )
}
