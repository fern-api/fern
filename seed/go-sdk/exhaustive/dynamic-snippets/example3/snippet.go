package example

import (
    client "github.com/exhaustive/fern/client"
    option "github.com/exhaustive/fern/option"
    context "context"
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
    client.Endpoints.Container.GetAndReturnSetOfObjects(
        context.TODO(),
        []*types.ObjectWithRequiredField{
            &types.ObjectWithRequiredField{
                String: "string",
            },
        },
    )
}
