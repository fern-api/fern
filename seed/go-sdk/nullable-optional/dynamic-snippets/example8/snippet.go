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
    request := &fern.NullableOptionalSearchUsersRequest{
        Query: "query",
        Department: fern.String(
            "department",
        ),
    }
    client.Nullableoptional.Searchusers(
        context.TODO(),
        request,
    )
}
