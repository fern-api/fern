package example

import (
    context "context"

    fern "github.com/cli-multi-spec-namespaced/fern"
    client "github.com/cli-multi-spec-namespaced/fern/client"
    option "github.com/cli-multi-spec-namespaced/fern/option"
    v2 "github.com/cli-multi-spec-namespaced/fern/v2"
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
    request := &v2.ListUsersRequest{
        PageSize: fern.Int(
            1,
        ),
    }
    client.V2.ListUsers(
        context.TODO(),
        request,
    )
}
