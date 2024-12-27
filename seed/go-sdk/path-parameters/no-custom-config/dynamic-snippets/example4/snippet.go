package example

import (
    client "github.com/path-parameters/fern/client"
    context "context"
    fern "github.com/path-parameters/fern"
)

func do() () {
    client := client.NewClient()
    client.User.CreateUser(
        context.TODO(),
        "tenant_id",
        &fern.User{
            Name: "name",
            Tags: []string{
                "tags",
                "tags",
            },
        },
    )
}
