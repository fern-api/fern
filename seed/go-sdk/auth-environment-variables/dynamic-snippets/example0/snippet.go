package example

import (
    client "github.com/auth-environment-variables/fern/client"
    option "github.com/auth-environment-variables/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithApiKey(
            "<value>",
        ),
    )
    client.Service.GetWithApiKey(
        context.TODO(),
    )
}
