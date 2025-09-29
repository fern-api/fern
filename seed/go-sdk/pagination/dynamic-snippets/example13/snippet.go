package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
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
    request := &fern.ListUsersCursorPaginationRequest{
        Page: fern.Int(
            1,
        ),
        PerPage: fern.Int(
            1,
        ),
        Order: fern.OrderAsc.Ptr(),
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
    client.Users.ListWithCursorPagination(
        context.TODO(),
        request,
    )
}
