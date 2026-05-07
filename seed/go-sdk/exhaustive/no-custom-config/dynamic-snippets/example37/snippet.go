package example

import (
    context "context"

    client "github.com/exhaustive/fern/client"
    endpoints "github.com/exhaustive/fern/endpoints"
    option "github.com/exhaustive/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
        option.WithToken(
            "<token>",
        ),
    )
    request := &endpoints.HTTPMethodsTestDeleteHTTPMethodsRequest{
        ID: "id",
    }
    client.Endpoints.HTTPMethods.HTTPMethodsTestDelete(
        context.TODO(),
        request,
    )
}
