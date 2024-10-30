package example

import (
    client "github.com/mixed-file-directory/fern/client"
    context "context"
    fern "github.com/mixed-file-directory/fern"
)

func do() () {
    client := client.NewClient()
    client.User.List(
        context.TODO(),
        &fern.ListUsersRequest{
            Limit: fern.Int(
                1,
            ),
        },
    )
}
