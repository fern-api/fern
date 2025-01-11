package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    context "context"
    path "github.com/fern-api/path-parameters-go"
)

func do() () {
    client := client.NewClient()
    client.User.CreateUser(
        context.TODO(),
        "tenant_id",
        &path.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
    )
}
