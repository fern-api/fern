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
    request := &types.ObjectWithRequiredField{
        FieldString: "string",
    }
    client.Endpoints.HTTPMethods.TestPut(
        context.TODO(),
        "id",
        request,
    )
}
