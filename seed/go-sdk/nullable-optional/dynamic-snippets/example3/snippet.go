package example

import (
    context "context"
    fern "github.com/nullable-optional/fern"
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListUsersRequest{
        Limit: fern.Int(
            1,
        ),
        Offset: fern.Int(
            1,
        ),
        IncludeDeleted: fern.Bool(
            true,
        ),
        SortBy: fern.String(
            "sortBy",
        ),
    }
    client.NullableOptional.ListUsers(
        context.TODO(),
        request,
    )
}
