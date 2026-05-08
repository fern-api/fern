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
    request := &endpoints.TestPatchHTTPMethodsRequest{
        ID: "id",
        Body: &fern.TypesObjectWithOptionalField{},
    }
    client.Endpoints.HTTPMethods.TestPatch(
        context.TODO(),
        request,
    )
}
