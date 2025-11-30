package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    types "github.com/exhaustive/fern/types"
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
    request := []*types.ObjectWithRequiredField{
        &types.ObjectWithRequiredField{
            FieldString: "string",
        },
    }
    client.Endpoints.Container.GetAndReturnSetOfObjects(
        context.TODO(),
        request,
    )
}
