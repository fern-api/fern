package example

import (
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
    context "context"
    fern "github.com/path-parameters/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
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
