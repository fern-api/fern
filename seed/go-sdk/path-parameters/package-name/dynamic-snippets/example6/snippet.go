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
    request := &path.SearchUsersRequest{
        Limit: path.Int(
            1,
        ),
    }
    client.User.SearchUsers(
        context.TODO(),
        "tenant_id",
        "user_id",
        request,
    )
}
