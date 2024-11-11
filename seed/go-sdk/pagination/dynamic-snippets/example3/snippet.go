package example

import (
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
    context "context"
    fern "github.com/pagination/fern"
)

func do() () {
    client := client.NewClient(
        option.WithToken(
            "<token>",
        ),
    )
    client.Users.ListWithBodyOffsetPagination(
        context.TODO(),
        &fern.ListUsersBodyOffsetPaginationRequest{
            Pagination: &fern.WithPage{
                Page: fern.Int(
                    1,
                ),
            },
        },
    )
}
