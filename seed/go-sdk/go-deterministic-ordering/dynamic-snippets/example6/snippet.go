package example

import (
    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
    types "github.com/go-deterministic-ordering/fern/types"
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
    request := map[string]*types.MixedType{
        "string": &types.MixedType{
            Double: 1.1,
        },
    }
    client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnion(
        context.TODO(),
        request,
    )
}
