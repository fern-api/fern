package example

import (
    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
    unions "github.com/fern-api/unions-go"
    context "context"
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
