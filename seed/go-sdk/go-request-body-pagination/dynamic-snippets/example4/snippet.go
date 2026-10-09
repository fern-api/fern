package example

import (
    context "context"

    fern "github.com/go-request-body-pagination/fern"
    client "github.com/go-request-body-pagination/fern/client"
    option "github.com/go-request-body-pagination/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListUsersRequiredAliasBodyCursorPaginationRequest{
        Cursor: "cursor",
    }
    client.Users.ListWithRequiredAliasBodyCursorPagination(
        context.TODO(),
        request,
    )
}
