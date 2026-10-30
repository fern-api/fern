package example

import (
    context "context"

    fern "github.com/path-parameters/fern"
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.UpdateUserRequest{
        Body: &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
    }
    _, err := client.User.UpdateUser(
        context.TODO(),
        "tenant_id",
        "user_id",
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
