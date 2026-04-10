package example

import (
    context "context"

    unions "github.com/fern-api/unions-go"
    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := []*unions.BigUnion{
        &unions.BigUnion{
            BigUnionZero: &unions.BigUnionZero{
                Type: unions.BigUnionZeroTypeNormalSweet,
                Value: "value",
            },
        },
        &unions.BigUnion{
            BigUnionZero: &unions.BigUnionZero{
                Type: unions.BigUnionZeroTypeNormalSweet,
                Value: "value",
            },
        },
    }
    client.Bigunion.UpdateMany(
        context.TODO(),
        request,
    )
}
