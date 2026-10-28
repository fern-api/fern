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
    request := &fern.DeleteUserRequest{
        Username: fern.String(
            "xy",
        ),
    }
    _, err := client.Nullable.DeleteUser(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
