package example

import (
    context "context"

    client "github.com/go-deterministic-ordering/fern/client"
    option "github.com/go-deterministic-ordering/fern/option"
    types "github.com/go-deterministic-ordering/fern/types"
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
    request := map[string]*types.MixedType{
        "string": &types.MixedType{
            Double: 1.1,
        },
    }
    _, err := client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnion(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
