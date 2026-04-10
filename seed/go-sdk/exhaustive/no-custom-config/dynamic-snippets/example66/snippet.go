package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
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
    request := &fern.EndpointsParamsGetWithAllowMultipleQueryRequest{
        Query: []*string{
            fern.String(
                "query",
            ),
        },
        Number: []*int{
            fern.Int(
                1,
            ),
        },
    }
    client.EndpointsParams.EndpointsParamsGetWithAllowMultipleQuery(
        context.TODO(),
        request,
    )
}
