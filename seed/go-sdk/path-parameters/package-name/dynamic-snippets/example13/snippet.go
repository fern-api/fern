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
    request := &path.UserSearchUsersRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Limit: path.Int(
            1,
        ),
    }
    client.User.Searchusers(
        context.TODO(),
        request,
    )
}
