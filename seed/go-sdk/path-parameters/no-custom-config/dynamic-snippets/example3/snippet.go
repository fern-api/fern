package example

import (
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
    fern "github.com/path-parameters/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUsersRequest{
        TenantId: "tenant_id",
        UserId: "user_id",
    }
    client.User.GetUser(
        context.TODO(),
        request,
    )
}
