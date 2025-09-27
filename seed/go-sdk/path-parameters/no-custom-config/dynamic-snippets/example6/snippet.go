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
    request := &fern.SearchUsersRequest{
        Limit: fern.Int(
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
