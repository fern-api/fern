package example

import (
    client "github.com/custom-auth/fern/client"
    option "github.com/custom-auth/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithCustomAuthScheme(
            "<value>",
        ),
    )
    request := map[string]any{
        "key": "value",
    }
    client.CustomAuth.PostWithCustomAuth(
        context.TODO(),
        request,
    )
}
