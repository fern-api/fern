package example

import (
    client "github.com/unions/fern/client"
    option "github.com/unions/fern/option"
    context "context"
    fern "github.com/unions/fern"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    client.Union.Update(
        context.TODO(),
        &fern.Shape{
            Circle: &fern.Circle{
                Radius: 1.1,
            },
            Id: "id",
        },
    )
}
