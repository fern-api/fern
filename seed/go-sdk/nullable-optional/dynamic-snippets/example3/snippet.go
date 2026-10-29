package example

import (
    context "context"

    fern "github.com/nullable-optional/fern"
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
)

func do() error {
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
    _, err := client.NullableOptional.ListUsers(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
