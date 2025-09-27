package example

import (
    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
    unionsgo "github.com/fern-api/unions-go"
    context "context"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &unionsgo.Shape{
        Circle: &unionsgo.Circle{
            Radius: 1.1,
        },
        Id: "id",
    }
    client.Union.Update(
        context.TODO(),
        request,
    )
}
