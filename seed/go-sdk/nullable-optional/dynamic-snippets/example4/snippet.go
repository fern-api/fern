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
    client.NullableOptional.SearchUsers(
        context.TODO(),
        &fern.SearchUsersRequest{
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
        },
    )
}
