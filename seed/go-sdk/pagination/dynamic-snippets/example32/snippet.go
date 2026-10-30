package example

import (
    context "context"

    fern "github.com/pagination/fern"
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.ListUsersOptionalDataRequest{
        Page: fern.Int(
            1,
        ),
    }
    _, err := client.Users.ListWithOptionalData(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
