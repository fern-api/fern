package example

import (
    context "context"

    fern "github.com/mixed-file-directory/fern"
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
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
