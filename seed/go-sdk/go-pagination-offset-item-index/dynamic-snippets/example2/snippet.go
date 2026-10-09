package example

import (
    context "context"

    fern "github.com/go-pagination-offset-item-index/fern"
    client "github.com/go-pagination-offset-item-index/fern/client"
    option "github.com/go-pagination-offset-item-index/fern/option"
)

func do() {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListPlantsWithBodyOffsetRequest{
        Offset: fern.Int(
            1,
        ),
        Count: fern.Int(
            1,
        ),
    }
    client.Plants.ListWithBodyOffset(
        context.TODO(),
        request,
    )
}
