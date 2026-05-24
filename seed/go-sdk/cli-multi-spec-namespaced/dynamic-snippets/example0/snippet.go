package example

import (
    context "context"

    client "github.com/cli-multi-spec-namespaced/fern/client"
    option "github.com/cli-multi-spec-namespaced/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
        option.WithAPIKey(
            "<X-Api-Key>",
        ),
    )
    client.V1.ListUsers(
        context.TODO(),
    )
}
