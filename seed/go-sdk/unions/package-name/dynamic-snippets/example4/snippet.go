package example

import (
    client "github.com/fern-api/unions-go/client"
    option "github.com/fern-api/unions-go/option"
    context "context"
    unionsgo "github.com/fern-api/unions-go"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Union.Update(
        context.TODO(),
        &unionsgo.Shape{
            Circle: &unionsgo.Circle{
                Radius: 1.1,
            },
            Id: "id",
        },
    )
}
