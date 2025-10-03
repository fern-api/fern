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
    request := &inlineusers.ListUsersOffsetStepPaginationRequest{
        Page: fern.Int(
            1,
        ),
        Limit: fern.Int(
            1,
        ),
        Order: inlineusers.OrderAsc.Ptr(),
    }
    client.InlineUsers.InlineUsers.ListWithOffsetStepPagination(
        context.TODO(),
        request,
    )
}
