package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    context "context"
    fern "github.com/exhaustive/fern"
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
    client.ReqWithHeaders.GetWithCustomHeader(
        context.TODO(),
        &fern.ReqWithHeaders{
            XTestServiceHeader: "X-TEST-SERVICE-HEADER",
            XTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
            Body: "string",
        },
    )
}
