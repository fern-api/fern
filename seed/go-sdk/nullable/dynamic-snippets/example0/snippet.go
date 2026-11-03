package example

import (
    context "context"

    fern "github.com/nullable/fern"
    client "github.com/nullable/fern/client"
    option "github.com/nullable/fern/option"
)

func do() error {
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
    _, err := client.Nullable.GetUsers(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
