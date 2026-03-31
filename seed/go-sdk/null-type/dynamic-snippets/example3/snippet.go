package example

import (
    context "context"

    fern "github.com/null-type/fern"
    client "github.com/null-type/fern/client"
    option "github.com/null-type/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUsersRequest{
        Id: "id",
    }
    client.Users.Get(
        context.TODO(),
        request,
    )
}
