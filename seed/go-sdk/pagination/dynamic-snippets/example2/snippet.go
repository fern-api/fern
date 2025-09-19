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
    client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPagination(
        context.TODO(),
        &inlineusers.ListUsersMixedTypeCursorPaginationRequest{
            Cursor: fern.String(
                "cursor",
            ),
        },
    )
}
