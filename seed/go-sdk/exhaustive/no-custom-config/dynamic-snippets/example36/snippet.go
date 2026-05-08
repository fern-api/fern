package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
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
    request := &endpoints.TestPutHTTPMethodsRequest{
        ID: "id",
        Body: &fern.TypesObjectWithRequiredField{
            FieldString: "string",
        },
    }
    client.Endpoints.HTTPMethods.TestPut(
        context.TODO(),
        request,
    )
}
