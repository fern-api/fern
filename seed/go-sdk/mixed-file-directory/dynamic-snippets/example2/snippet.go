package example

import (
    context "context"

    fern "github.com/mixed-file-directory/fern"
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    user "github.com/mixed-file-directory/fern/user"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &user.ListUserEventsRequest{
        Limit: fern.Int(
            1,
        ),
    }
    client.User.Events.ListEvents(
        context.TODO(),
        request,
    )
}
