package example

import (
    context "context"

    fern "github.com/server-url-templating/fern"
    client "github.com/server-url-templating/fern/client"
    option "github.com/server-url-templating/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUserRequest{
        UserID: "userId",
    }
    _, err := client.GetUser(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
