package example

import (
    context "context"

    path "github.com/fern-api/path-parameters-go"
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.SearchUsersRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Limit: path.Int(
            1,
        ),
    }
    _, err := client.User.SearchUsers(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
