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
        Circle: &unions.Circle{
            Radius: 1.1,
        },
        Id: "id",
    }
    client.Union.Update(
        context.TODO(),
        request,
    )
}
