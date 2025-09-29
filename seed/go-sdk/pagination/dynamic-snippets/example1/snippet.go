package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    inlineusers "github.com/pagination/fern/inlineusers"
    fern "github.com/pagination/fern"
    context "context"
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
    request := &inlineusers.ListUsersCursorPaginationRequest{
        Page: fern.Int(
            1,
        ),
        PerPage: fern.Int(
            1,
        ),
        Order: inlineusers.OrderAsc.Ptr(),
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
    client.InlineUsers.InlineUsers.ListWithCursorPagination(
        context.TODO(),
        request,
    )
}
