package example

import (
    client "github.com/path-parameters/fern/client"
    context "context"
    fern "github.com/path-parameters/fern"
)

func do() () {
    client := client.NewClient()
    client.User.SearchUsers(
        context.TODO(),
        "tenantId",
        "userId",
        &fern.SearchUsersRequest{
            Limit: fern.Int(
                1,
            ),
        },
    )
}
