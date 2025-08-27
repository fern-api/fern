package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    context "context"
    fern "github.com/nullable-optional/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.NullableOptional.ListUsers(
        context.TODO(),
        &fern.ListUsersRequest{
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
        },
    )
}
