package example

import (
    context "context"

    fern "github.com/pagination/fern"
    client "github.com/pagination/fern/client"
    option "github.com/pagination/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &fern.UsersListWithAliasedDataRequest{
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
    client.Users.Listwithaliaseddata(
        context.TODO(),
        request,
    )
}
