package example

import (
    context "context"

    fern "github.com/pagination-custom/fern"
    client "github.com/pagination-custom/fern/client"
    option "github.com/pagination-custom/fern/option"
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
    request := &fern.UsersListWithCustomPagerRequest{}
    client.Users.Listwithcustompager(
        context.TODO(),
        request,
    )
}
