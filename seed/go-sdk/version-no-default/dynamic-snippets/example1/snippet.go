package example

import (
    context "context"

    fern "github.com/version-no-default/fern"
    client "github.com/version-no-default/fern/client"
    option "github.com/version-no-default/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UserGetUserRequest{
        UserID: "userId",
    }
    client.User.Getuser(
        context.TODO(),
        request,
    )
}
