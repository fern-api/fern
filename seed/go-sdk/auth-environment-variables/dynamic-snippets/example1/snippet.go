package example

import (
    client "github.com/auth-environment-variables/fern/client"
    option "github.com/auth-environment-variables/fern/option"
    context "context"
    fern "github.com/auth-environment-variables/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithApiKey(
            "<value>",
        ),
    )
    client.Service.GetWithHeader(
        context.TODO(),
        &fern.HeaderAuthRequest{
            XEndpointHeader: "X-Endpoint-Header",
        },
    )
}
