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
    request := &inlineusers.ListUsersMixedTypeCursorPaginationRequest{
        Cursor: fern.String(
            "cursor",
        ),
    }
    client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPagination(
        context.TODO(),
        request,
    )
}
