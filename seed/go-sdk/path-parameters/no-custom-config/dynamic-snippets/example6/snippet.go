package example

import (
    context "context"

    fern "github.com/path-parameters/fern"
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.SearchUsersRequest{
        TenantID: "tenant_id",
        UserID: "user_id",
        Limit: fern.Int(
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
