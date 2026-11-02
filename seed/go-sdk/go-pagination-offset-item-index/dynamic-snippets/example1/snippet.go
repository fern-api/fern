package example

import (
    context "context"

    fern "github.com/go-pagination-offset-item-index/fern"
    client "github.com/go-pagination-offset-item-index/fern/client"
    option "github.com/go-pagination-offset-item-index/fern/option"
)

func do() error {
    client := client.NewClient(
        option.WithBaseURL(
            "https://api.fern.com",
        ),
    )
    request := &fern.ListPlantsWithRequiredOffsetRequest{
        Offset: 1,
        Count: 1,
    }
    _, err := client.Plants.ListWithRequiredOffset(
        context.TODO(),
        request,
    )
    if err != nil {
        return err
    }
    return nil
}
