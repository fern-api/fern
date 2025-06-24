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
    client.Nullable.DeleteUser(
        context.TODO(),
        &fern.DeleteUserRequest{
            Username: fern.String(
                "xy",
            ),
        },
    )
}
