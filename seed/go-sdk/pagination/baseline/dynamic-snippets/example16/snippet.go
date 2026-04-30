package example

import (
    context "context"

    fern "github.com/pagination/fern"
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
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
    request := &fern.ListUsersTopLevelBodyCursorPaginationRequest{
        Cursor: fern.String(
            "initial_cursor",
        ),
        Filter: fern.String(
            "active",
        ),
    }
    client.Users.ListWithTopLevelBodyCursorPagination(
        context.TODO(),
        request,
    )
}
