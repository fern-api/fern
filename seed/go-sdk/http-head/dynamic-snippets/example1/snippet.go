package example

import (
    client "github.com/http-head/fern/client"
    option "github.com/http-head/fern/option"
    context "context"
    fern "github.com/http-head/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.List(
        context.TODO(),
        &fern.ListUsersRequest{
            Limit: 1,
        },
    )
}
