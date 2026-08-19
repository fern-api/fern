package example

import (
    context "context"

    client "github.com/literal-user-agent/fern/client"
    option "github.com/literal-user-agent/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Ping(
        context.TODO(),
    )
}
