package example

import (
    context "context"

    fern "github.com/nullable/fern"
    client "github.com/nullable/fern/client"
    option "github.com/nullable/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.NullableCreateUserRequest{
        Username: "username",
    }
    client.Nullable.Createuser(
        context.TODO(),
        request,
    )
}
