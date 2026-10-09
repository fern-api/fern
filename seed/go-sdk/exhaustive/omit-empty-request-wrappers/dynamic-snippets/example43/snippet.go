package example

import (
    context "context"

    fern "github.com/exhaustive/fern"
    client "github.com/exhaustive/fern/client"
    endpoints "github.com/exhaustive/fern/endpoints"
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
    request := &endpoints.CreateWithBodyAndQuery{
        Fields: fern.String(
            "_fields",
        ),
        Body: &types.ObjectWithRequiredField{
            FieldString: "string",
        },
    }
    client.Endpoints.Params.CreateWithBodyAndQuery(
        context.TODO(),
        request,
    )
}
