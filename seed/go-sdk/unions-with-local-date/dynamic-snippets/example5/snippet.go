package example

import (
    context "context"

    fern "github.com/unions-with-local-date/fern"
    client "github.com/unions-with-local-date/fern/client"
    option "github.com/unions-with-local-date/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := []*fern.BigUnion{
        &fern.BigUnion{
            BigUnionZero: &fern.BigUnionZero{
                Type: fern.BigUnionZeroTypeNormalSweet,
                Value: "value",
            },
        },
        &fern.BigUnion{
            BigUnionZero: &fern.BigUnionZero{
                Type: fern.BigUnionZeroTypeNormalSweet,
                Value: "value",
            },
        },
    }
    client.Bigunion.UpdateMany(
        context.TODO(),
        request,
    )
}
