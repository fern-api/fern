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
    request := []*types.ObjectWithRequiredField{
        &types.ObjectWithRequiredField{
            FieldString: "string",
        },
        &types.ObjectWithRequiredField{
            FieldString: "string",
        },
    }
    _, err := client.Endpoints.Container.GetAndReturnListOfObjects(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
