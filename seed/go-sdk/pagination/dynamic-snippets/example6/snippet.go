package example

import (
    context "context"

    fern "github.com/pagination/fern"
    client "github.com/pagination/fern/client"
    inlineusers "github.com/pagination/fern/inlineusers"
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
    request := &inlineusers.ListUsersBodyOffsetPaginationRequest{
        Pagination: &inlineusers.WithPage{
            Page: fern.Int(
                1,
            ),
        },
    }
    client.InlineUsers.InlineUsers.ListWithBodyOffsetPagination(
        context.TODO(),
        request,
    )
}
