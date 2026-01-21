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
    request := &fern.ListUsersMixedTypeCursorPaginationRequest{}
    client.Users.ListWithMixedTypeCursorPagination(
        context.TODO(),
        request,
    )
}
