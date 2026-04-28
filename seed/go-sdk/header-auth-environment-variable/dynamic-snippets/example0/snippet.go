package example

import (
    context "context"

    client "github.com/header-auth-environment-variable/fern/client"
    option "github.com/header-auth-environment-variable/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithHeaderTokenAuth(
            "YOUR_HEADER_VALUE",
        ),
    )
    client.Service.GetWithBearerToken(
        context.TODO(),
    )
}
