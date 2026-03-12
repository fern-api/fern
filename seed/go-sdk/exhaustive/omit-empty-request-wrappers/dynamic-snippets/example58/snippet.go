package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    fern "github.com/exhaustive/fern"
    context "context"
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
    request := &fern.ReqWithHeaders{
        XTestServiceHeader: "X-TEST-SERVICE-HEADER",
        XTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
        Body: "string",
    }
    client.ReqWithHeaders.GetWithCustomHeader(
        context.TODO(),
        request,
    )
}
