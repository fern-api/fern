package example

import (
    context "context"

    fern "github.com/server-url-templating/fern"
    client "github.com/server-url-templating/fern/client"
    option "github.com/server-url-templating/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.GetUserRequest{
        UserId: "userId",
    }
    client.GetUser(
        context.TODO(),
        request,
    )
}
