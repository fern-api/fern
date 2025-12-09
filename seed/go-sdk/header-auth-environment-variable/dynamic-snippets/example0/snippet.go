package example

import (
    client "github.com/header-auth-environment-variable/fern/client"
    option "github.com/header-auth-environment-variable/fern/option"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithHeaderTokenAuth(
            "<value>",
        ),
    )
    client.Service.GetWithBearerToken(
        context.TODO(),
    )
}
