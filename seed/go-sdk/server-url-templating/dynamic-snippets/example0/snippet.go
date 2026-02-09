package example

import (
    client "github.com/server-url-templating/fern/client"
    option "github.com/server-url-templating/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.GetUsers(
        context.TODO(),
    )
}
