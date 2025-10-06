package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    path "github.com/fern-api/path-parameters-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &path.User{
        Name: "name",
        Tags: []string{
            "tags",
            "tags",
        },
    }
    client.User.CreateUser(
        context.TODO(),
        "tenant_id",
        request,
    )
}
