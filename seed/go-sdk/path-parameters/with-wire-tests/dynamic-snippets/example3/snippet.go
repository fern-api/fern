package example

import (
    client "github.com/path-parameters/fern/client"
    option "github.com/path-parameters/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.GetUser(
        context.TODO(),
        "tenant_id",
        "user_id",
    )
}
