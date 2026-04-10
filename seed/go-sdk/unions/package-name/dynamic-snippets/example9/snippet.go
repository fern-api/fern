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
    request := &unions.Shape{
        ShapeZero: &unions.ShapeZero{
            Type: unions.ShapeZeroTypeCircle,
            Radius: 1.1,
        },
    }
    client.Union.Update(
        context.TODO(),
        request,
    )
}
