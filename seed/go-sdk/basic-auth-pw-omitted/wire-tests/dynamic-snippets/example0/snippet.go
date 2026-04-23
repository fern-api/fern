package example

import (
    context "context"

    client "github.com/basic-auth-pw-omitted/fern/client"
    option "github.com/basic-auth-pw-omitted/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithBasicAuth(
            "<username>",
        ),
    )
    client.BasicAuth.GetWithBasicAuth(
        context.TODO(),
    )
}
