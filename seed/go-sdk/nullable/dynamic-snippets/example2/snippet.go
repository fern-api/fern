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
    request := &fern.DeleteUserRequest{
        Username: fern.String(
            "xy",
        ),
    }
    client.Nullable.DeleteUser(
        context.TODO(),
        request,
    )
}
