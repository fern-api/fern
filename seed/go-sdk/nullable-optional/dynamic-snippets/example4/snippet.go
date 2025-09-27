package example

import (
    client "github.com/nullable-optional/fern/client"
    option "github.com/nullable-optional/fern/option"
    fern "github.com/nullable-optional/fern"
    context "context"
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
