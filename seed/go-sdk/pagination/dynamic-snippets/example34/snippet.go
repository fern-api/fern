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
    request := &fern.ListUsersAliasedDataRequest{
        Page: fern.Int(
            1,
        ),
        PerPage: fern.Int(
            1,
        ),
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
    _, err := client.Users.ListWithAliasedData(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
