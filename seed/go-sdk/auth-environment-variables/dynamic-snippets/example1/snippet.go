package example

import (
    client "github.com/auth-environment-variables/fern/client"
    option "github.com/auth-environment-variables/fern/option"
    fern "github.com/auth-environment-variables/fern"
    context "context"
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
    request := &fern.HeaderAuthRequest{
        XEndpointHeader: "X-Endpoint-Header",
    }
    client.Service.GetWithHeader(
        context.TODO(),
        request,
    )
}
