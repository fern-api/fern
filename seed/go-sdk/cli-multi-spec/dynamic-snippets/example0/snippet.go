package example

import (
    context "context"

    client "github.com/cli-multi-spec/fern/client"
    option "github.com/cli-multi-spec/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.ListUsers(
        context.TODO(),
    )
}
