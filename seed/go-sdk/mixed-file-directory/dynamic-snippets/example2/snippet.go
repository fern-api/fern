package example

import (
    client "github.com/mixed-file-directory/fern/client"
    option "github.com/mixed-file-directory/fern/option"
    context "context"
    user "github.com/mixed-file-directory/fern/user"
    fern "github.com/mixed-file-directory/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.Events.ListEvents(
        context.TODO(),
        &user.ListUserEventsRequest{
            Limit: fern.Int(
                1,
            ),
        },
    )
}
