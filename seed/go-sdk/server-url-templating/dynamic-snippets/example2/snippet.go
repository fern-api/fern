package example

import (
    client "github.com/server-url-templating/fern/client"
    option "github.com/server-url-templating/fern/option"
    fern "github.com/server-url-templating/fern"
    context "context"
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
