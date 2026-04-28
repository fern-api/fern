package example

import (
    context "context"

    client "github.com/basic-auth-environment-variables/fern/client"
    option "github.com/basic-auth-environment-variables/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithBasicAuth(
            "YOUR_USERNAME",
            "YOUR_PASSWORD",
        ),
    )
    request := map[string]any{
        "key": "value",
    }
    client.BasicAuth.PostWithBasicAuth(
        context.TODO(),
        request,
    )
}
