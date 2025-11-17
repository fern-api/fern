package example

import (
    client "github.com/fern-api/path-parameters-go/client"
    option "github.com/fern-api/path-parameters-go/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.User.GetUserSpecifics(
        context.TODO(),
        "tenant_id",
        "user_id",
        1,
        "thought",
    )
}
