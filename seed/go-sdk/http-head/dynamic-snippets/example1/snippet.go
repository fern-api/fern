package example

import (
    context "context"

    fern "github.com/http-head/fern"
    client "github.com/http-head/fern/client"
    option "github.com/http-head/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListUsersRequest{
        Limit: 1,
    }
    _, err := client.User.List(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
