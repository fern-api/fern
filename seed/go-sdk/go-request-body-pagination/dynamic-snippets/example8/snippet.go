package example

import (
    context "context"

    fern "github.com/go-request-body-pagination/fern"
    client "github.com/go-request-body-pagination/fern/client"
    option "github.com/go-request-body-pagination/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListUsersNestedRequiredBodyCursorPaginationRequest{
        Pagination: &fern.WithRequiredCursor{
            Cursor: "cursor",
        },
    }
    _, err := client.Users.ListWithNestedRequiredBodyCursorPagination(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
