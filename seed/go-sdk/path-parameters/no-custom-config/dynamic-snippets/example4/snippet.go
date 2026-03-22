package example

import (
    context "context"
    fern "github.com/path-parameters/fern"
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.User{
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
