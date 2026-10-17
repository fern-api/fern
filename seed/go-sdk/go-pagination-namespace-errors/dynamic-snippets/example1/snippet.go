package example

import (
    context "context"

    fern "github.com/go-pagination-namespace-errors/fern"
    client "github.com/go-pagination-namespace-errors/fern/client"
    option "github.com/go-pagination-namespace-errors/fern/option"
    users "github.com/go-pagination-namespace-errors/fern/users"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &users.ListUsersRequest{
        Cursor: fern.String(
            "cursor",
        ),
    }
    client.Users.List(
        context.TODO(),
        request,
    )
}
