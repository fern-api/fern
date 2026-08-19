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
    request := &fern.SearchUsersRequest{
        Query: "query",
        Department: fern.String(
            "department",
        ),
        Role: fern.String(
            "role",
        ),
        IsActive: fern.Bool(
            true,
        ),
    }
    client.NullableOptional.SearchUsers(
        context.TODO(),
        request,
    )
}
