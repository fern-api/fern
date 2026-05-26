package example

import (
    context "context"

    fern "github.com/cli-multi-spec/fern"
    client "github.com/cli-multi-spec/fern/client"
    option "github.com/cli-multi-spec/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUserRequest{
        UserID: "userId",
    }
    client.GetUser(
        context.TODO(),
        request,
    )
}
