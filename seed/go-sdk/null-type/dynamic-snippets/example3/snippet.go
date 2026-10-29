package example

import (
    context "context"

    fern "github.com/null-type/fern"
    client "github.com/null-type/fern/client"
    option "github.com/null-type/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUsersRequest{
        ID: "id",
    }
    _, err := client.Users.Get(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
