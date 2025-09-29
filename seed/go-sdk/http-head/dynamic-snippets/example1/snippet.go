package example

import (
    client "github.com/http-head/fern/client"
    option "github.com/http-head/fern/option"
    fern "github.com/http-head/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListUsersRequest{
        Limit: 1,
    }
    client.User.List(
        context.TODO(),
        request,
    )
}
