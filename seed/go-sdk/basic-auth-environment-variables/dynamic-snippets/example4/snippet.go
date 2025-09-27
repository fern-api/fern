package example

import (
    client "github.com/basic-auth-environment-variables/fern/client"
    option "github.com/basic-auth-environment-variables/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithBasicAuth(
            "<username>",
            "<password>",
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
