package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    context "context"
    inlineusers "github.com/pagination/fern/inlineusers"
    fern "github.com/pagination/fern"
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
    client.InlineUsers.InlineUsers.ListWithCursorPagination(
        context.TODO(),
        &inlineusers.ListUsersCursorPaginationRequest{
            Page: fern.Int(
                1.1,
            ),
            PerPage: fern.Int(
                1.1,
            ),
            Order: inlineusers.OrderAsc.Ptr(),
            StartingAfter: fern.String(
                "starting_after",
            ),
        },
    )
}
