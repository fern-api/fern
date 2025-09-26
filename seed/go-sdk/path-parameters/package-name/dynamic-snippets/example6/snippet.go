package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    pathparametersgo "github.com/fern-api/path-parameters-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &pathparametersgo.SearchUsersRequest{
        Limit: pathparametersgo.Int(
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
