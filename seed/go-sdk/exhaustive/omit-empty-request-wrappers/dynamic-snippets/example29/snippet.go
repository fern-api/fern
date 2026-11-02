package example

import (
    context "context"

    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
)

func do() error {
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
    _, err := client.Endpoints.Object.GetAndReturnWithRequiredNestedObject(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
