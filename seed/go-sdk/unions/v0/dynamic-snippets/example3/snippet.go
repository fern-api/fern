package example

import (
    context "context"

    fern "github.com/unions/fern"
    client "github.com/unions/fern/client"
    option "github.com/unions/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.BigUnion{
        BigUnionZero: &fern.BigUnionZero{
            Type: fern.BigUnionZeroTypeNormalSweet,
            Value: "value",
        },
    }
    client.Bigunion.Update(
        context.TODO(),
        request,
    )
}
