package example

import (
    context "context"

    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
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
    request := &types.ObjectWithRequiredNestedObject{
        RequiredString: "hello",
        RequiredObject: &types.NestedObjectWithRequiredField{
            FieldString: "nested",
            NestedObject: &types.ObjectWithOptionalField{},
        },
    }
    client.Endpoints.Object.GetAndReturnWithRequiredNestedObject(
        context.TODO(),
        request,
    )
}
