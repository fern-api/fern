package example

import (
    context "context"

    client "github.com/go-deterministic-ordering/fern/client"
    endpoints "github.com/go-deterministic-ordering/fern/endpoints"
    option "github.com/go-deterministic-ordering/fern/option"
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
    request := &endpoints.ModifyResourceAtInlinedPath{
        Param: "param",
        Body: "string",
    }
    client.Endpoints.Params.ModifyWithInlinePath(
        context.TODO(),
        request,
    )
}
