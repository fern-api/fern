package example

import (
    client "github.com/nullable/fern/client"
    option "github.com/nullable/fern/option"
    fern "github.com/nullable/fern"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUsersRequest{
        Usernames: []*string{
            fern.String(
                "usernames",
            ),
        },
        Avatar: fern.String(
            "avatar",
        ),
        Activated: []*bool{
            fern.Bool(
                true,
            ),
        },
        Tags: []*string{
            fern.String(
                "tags",
            ),
        },
        Extra: fern.Bool(
            true,
        ),
    }
    client.Nullable.GetUsers(
        context.TODO(),
        request,
    )
}
