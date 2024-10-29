package example

import (
    client "github.com/mixed-file-directory/fern/client"
    context "context"
    user "github.com/mixed-file-directory/fern/user"
)

func do() () {
    client := client.NewClient()
    client.User.Events.ListEvents(
        context.TODO(),
        &user.ListUserEventsRequest{},
    )}
