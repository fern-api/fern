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
    request := &endpoints.GetAndReturnNestedWithRequiredFieldObjectRequest{
        String: "string",
        Body: &fern.TypesNestedObjectWithRequiredField{
            FieldString: "string",
            NestedObject: &fern.TypesObjectWithOptionalField{},
        },
    }
    client.Endpoints.Object.GetAndReturnNestedWithRequiredField(
        context.TODO(),
        request,
    )
}
