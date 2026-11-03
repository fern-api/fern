package example

import (
    context "context"

    fern "github.com/pagination/fern"
    client "github.com/pagination/fern/client"
    inlineusers "github.com/pagination/fern/inlineusers"
    option "github.com/pagination/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &inlineusers.ListWithOffsetPaginationHasNextPageRequest{
        Page: fern.Int(
            1,
        ),
        Limit: fern.Int(
            1,
        ),
        Order: inlineusers.OrderAsc.Ptr(),
    }
    _, err := client.InlineUsers.InlineUsers.ListWithOffsetPaginationHasNextPage(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
