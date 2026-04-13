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
    request := &fern.InlineUsersInlineUsersListWithDoubleOffsetPaginationRequest{
        Page: fern.Float64(
            1.1,
        ),
        PerPage: fern.Float64(
            1.1,
        ),
        Order: fern.InlineUsersOrderAsc.Ptr(),
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
    client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithDoubleOffsetPagination(
        context.TODO(),
        request,
    )
}
