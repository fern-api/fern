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
    request := &fern.Shape{
        Circle: &fern.Circle{
            Radius: 1.1,
        },
        Id: "id",
    }
    client.Union.Update(
        context.TODO(),
        request,
    )
}
