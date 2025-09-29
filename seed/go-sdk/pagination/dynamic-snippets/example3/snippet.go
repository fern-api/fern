package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    inlineusers "github.com/pagination/fern/inlineusers"
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
    request := &inlineusers.ListUsersMixedTypeCursorPaginationRequest{}
    client.InlineUsers.InlineUsers.ListWithMixedTypeCursorPagination(
        context.TODO(),
        request,
    )
}
