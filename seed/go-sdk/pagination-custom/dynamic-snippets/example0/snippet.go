package example

import (
    client "github.com/pagination-custom/fern/client"
    option "github.com/pagination-custom/fern/option"
    fern "github.com/pagination-custom/fern"
    context "context"
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
    request := &fern.ListUsernamesRequestCustom{
        StartingAfter: fern.String(
            "starting_after",
        ),
    }
    client.Users.ListUsernamesCustom(
        context.TODO(),
        request,
    )
}
