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
    request := &fern.ListUsersOffsetStepPaginationRequest{
        Page: fern.Int(
            1,
        ),
        Limit: fern.Int(
            1,
        ),
        Order: fern.OrderAsc.Ptr(),
    }
    client.Users.ListWithOffsetStepPagination(
        context.TODO(),
        request,
    )
}
