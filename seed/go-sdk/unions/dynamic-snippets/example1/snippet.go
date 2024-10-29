package example

import (
    client "github.com/fern-api/unions-go/client"
    context "context"
    unions "github.com/fern-api/unions-go"
)

func do() () {
    client := client.NewClient()
    client.Union.Update(
        context.TODO(),
        &unions.Shape{
            Circle: &unions.Circle{
                Radius: 1.1,
            },
        },
    )
}
