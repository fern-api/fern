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
    request := &fern.InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest{
        Page: fern.Int(
            1,
        ),
        Limit: fern.Int(
            1,
        ),
        Order: fern.InlineUsersOrderAsc.Ptr(),
    }
    client.InlineUsersInlineUsers.InlineUsersInlineUsersListWithOffsetPaginationHasNextPage(
        context.TODO(),
        request,
    )
}
