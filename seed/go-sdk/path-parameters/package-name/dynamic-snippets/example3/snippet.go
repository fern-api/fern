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
    request := &path.GetUsersRequest{
        TenantId: "tenant_id",
        UserId: "user_id",
    }
    client.User.GetUser(
        context.TODO(),
        request,
    )
}
