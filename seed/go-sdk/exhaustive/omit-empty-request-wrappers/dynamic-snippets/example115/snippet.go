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
    request := &fern.ReqWithHeadersGetWithCustomHeaderRequest{
        TestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
        Body: "string",
    }
    client.Reqwithheaders.Getwithcustomheader(
        context.TODO(),
        request,
    )
}
