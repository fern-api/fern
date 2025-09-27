package example

import (
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    user "github.com/mixed-file-directory/fern/user"
    fern "github.com/mixed-file-directory/fern"
    context "context"
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
