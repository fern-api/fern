package example

import (
    client "github.com/nullable/fern/client"
    option "github.com/nullable/fern/option"
    context "context"
    fern "github.com/nullable/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Nullable.GetUsers(
        context.TODO(),
        &fern.GetUsersRequest{
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
        },
    )
}
