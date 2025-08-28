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
    client.Endpoints.Union.GetAndReturnUnion(
        context.TODO(),
        &types.Animal{
            Dog: &types.Dog{
                Name: "name",
                LikesToWoof: true,
            },
        },
    )
}
