package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    context "context"
    fern "github.com/pagination/fern"
)

func do() () {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    client.Users.ListWithCursorPagination(
        context.TODO(),
        &fern.ListUsersCursorPaginationRequest{
            StartingAfter: fern.String(
                "starting_after",
            ),
        },
    )
}
