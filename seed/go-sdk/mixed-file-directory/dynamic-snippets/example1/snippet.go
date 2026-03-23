package example

import (
    context "context"
    fern "github.com/mixed-file-directory/fern"
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
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
    }
    client.User.List(
        context.TODO(),
        request,
    )
}
